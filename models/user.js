"use strict";

const { NotFoundError, UnauthorizedError, BadRequestError } = require("../expressError");

const bcrypt = require("bcrypt");

const { BCRYPT_WORK_FACTOR } = require("../config");
const db = require("../db");

/** User of the site. */

class User {

  // constructor(username, password, first_name, last_name, phone) {
  //   this.username = username;
  //   this.password =

  // }

  /** Register new user. Returns
   *    {username, password, first_name, last_name, phone}
   */

  static async register({ username, password, first_name, last_name, phone }) {
    try {
      const hashedPassword = await bcrypt.hash(password, BCRYPT_WORK_FACTOR);
      const result = await db.query(
        `INSERT INTO users (username, password, first_name, last_name, phone)
           VALUES ($1, $2, $3, $4, $5)
           RETURNING username, password, first_name, last_name, phone`,
        [username, hashedPassword, first_name, last_name, phone]);
      return result.rows[0];
    } catch (err) {
      console.error("invalid input", err);
    }
  }

  /** Authenticate: is username/password valid? Returns boolean. */

  static async authenticate(username, password) {
    try {

      const result = await db.query(
        "SELECT password FROM users WHERE username = $1",
        [username]);
      let user = result.rows[0];
      if (user) {
        return await bcrypt.compare(password, user.password)
      }
      throw new BadRequestError("Invalid user/password");
    } catch (err) {
      console.error(err)
    }
  }

  /** Update last_login_at for user */

  static async updateLoginTimestamp(username) {
    try {
      const result = await db.query(
        "UPDATE users SET last_login_at = current_timestamp WHERE username = $1",
        [username]);
    } catch (err) {
      console.error(err);
    }
  }

  /** All: basic info on all users:
   * [{username, first_name, last_name}, ...] */

  static async all() {
    try {
      const results = await db.query(
        "SELECT username, first_name, last_name FROM users");

      // let out = results.map(r => {
      //   return ({ username, first_name, last_name })
      // });
      return results.rows;

    } catch (err) {
      console.error(err);
    }
  }

  /** Get: get user by username
   *
   * returns {username,
   *          first_name,
   *          last_name,
   *          phone,
   *          join_at,
   *          last_login_at } */

  static async get(username) {
    try {
      const results = await db.query(
        `SELECT username, 
                first_name,
                last_name,
                phone,
                join_at,
                last_login_at
            FROM users 
            WHERE username=$1`,
        [username]);

      if (!results.rows[0]) {
        throw new NotFoundError(`User ${username} doesn't exist`);
      }

      return results.rows[0];

    } catch (err) {
      console.error(err);
    }
  }

  /** Return messages from this user.
   *
   * [{id,  to_username, body, sent_at, read_at}]
   * where to_username is
   *   {username, first_name, last_name, phone}
   */

  static async messagesFrom(username) {
    try {
      const result = await db.query(
        `SELECT m.id,
                  m.to_username,
                  u.first_name AS to_first_name,
                  u.last_name AS to_last_name,
                  u.phone AS to_phone,
                  m.body,
                  m.sent_at,
                  m.read_at
             FROM messages AS m
             JOIN users AS u ON m.to_username = u.username
             WHERE m.from_username = $1`,
        [username]);

      let m = result.rows[0];

      if (!m) throw new NotFoundError(`No messages from: ${username}`);

      return [{
        id: m.id,
        to_user: {
          username: m.to_username,
          first_name: m.to_first_name,
          last_name: m.to_last_name,
          phone: m.to_phone,
        },
        body: m.body,
        sent_at: m.sent_at,
        read_at: m.read_at,
      }];
    } catch (err) {
      console.error(err);
    }

  }

  /** Return messages to this user.
   *
   * [{id, from_username:{id, first_name, last_name, phone}, body, sent_at, read_at}]
   *
   * where from_username is
   *   {id, first_name, last_name, phone}
   */

  static async messagesTo(username) {
    try {
      const result = await db.query(
        `SELECT m.id,
                m.from_username,
                u.first_name AS from_first_name,
                u.last_name AS from_last_name,
                u.phone AS from_phone,
                m.body,
                m.sent_at,
                m.read_at
           FROM messages AS m
           JOIN users AS u ON m.from_username = u.username
           WHERE m.to_username = $1`,
        [username]);

      let m = result.rows[0];

      if (!m) throw new NotFoundError(`No messages received by: ${username}`);

      return [{
        id: m.id,
        from_user: {
          username: m.from_username,
          first_name: m.from_first_name,
          last_name: m.from_last_name,
          phone: m.from_phone,
        },
        body: m.body,
        sent_at: m.sent_at,
        read_at: m.read_at,
      }];
    } catch (err) {
      console.error(err);
    }

  }
}


module.exports = User;
