"use strict";

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
      password = hashedPassword = await bcrypt.hash(
        password, BCRYPT_WORK_FACTOR);
        const result = await db.query(
          `INSERT INTO users (username, password, first_name, last_name, phone)
           VALUES ($1, $2, $3, $4, $5)
           RETURNING username, password, first_name, last_name, phone`,
        [username, password, first_name, last_name, phone]);
        return res.json(result.rows[0]);
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
      throw new UnauthorizedError("Invalid user/password");
    } catch (err) {
      console.error(err);
    }
  }

  /** Update last_login_at for user */

  static async updateLoginTimestamp(username) {
  }

  /** All: basic info on all users:
   * [{username, first_name, last_name}, ...] */

  static async all() {
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
  }

  /** Return messages from this user.
   *
   * [{id, to_user, body, sent_at, read_at}]
   *
   * where to_user is
   *   {username, first_name, last_name, phone}
   */

  static async messagesFrom(username) {
  }

  /** Return messages to this user.
   *
   * [{id, from_user, body, sent_at, read_at}]
   *
   * where from_user is
   *   {id, first_name, last_name, phone}
   */

  static async messagesTo(username) {
  }
}


module.exports = User;
