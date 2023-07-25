const pool = require('../src/config/db');

const Utils = {

    // Create a user database.
    async createUserDatabase() {
        await pool.query(`CREATE TYPE gender_enum AS ENUM ('Male', 'Female')`);
        await pool.query(`
        CREATE SEQUENCE users_user_id_seq
            START WITH 1
            INCREMENT BY 1
            NO MINVALUE
            NO MAXVALUE`);
        await pool.query(`CACHE 1`);
        await pool.query(`ALTER SEQUENCE users_user_id_seq OWNER TO ${process.env.PG_USER}`);

        await pool.query(`CREATE TABLE IF NOT EXISTS public.users
        (
            user_id integer NOT NULL DEFAULT nextval('users_user_id_seq'::regclass),
            username character varying(50) COLLATE pg_catalog."default" NOT NULL,
            encrypted_password character varying(256) COLLATE pg_catalog."default" NOT NULL,
            created_at timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
            password_changed_at timestamp with time zone,
            logged_out_at timestamp with time zone,
            is_admin boolean NOT NULL DEFAULT false,
            email character varying(100) COLLATE pg_catalog."default",
            profile_id integer,
            CONSTRAINT users_pkey PRIMARY KEY (user_id),
            CONSTRAINT users_email_key UNIQUE (email)
        )`);
        await pool.query(`ALTER TABLE public.users OWNER to ${process.env.PG_USER}`);
    },

    async createUserProfileDatabase() {
        await pool.query(`CREATE SEQUENCE user_profiles_profile_id_seq
        START WITH 1
        INCREMENT BY 1
        NO MINVALUE
        NO MAXVALUE`);
        await pool.query(`CACHE 1`);
        await pool.query(`ALTER SEQUENCE user_profiles_profile_id_seq OWNER TO ${process.env.PG_USER}`);

    await pool.query(`CREATE TABLE IF NOT EXISTS public.user_profiles
    (
        profile_id integer NOT NULL DEFAULT nextval('user_profiles_profile_id_seq'::regclass),
        user_id integer,
        name character varying(100) COLLATE pg_catalog."default" NOT NULL,
        birthdate date,
        age integer,
        sex gender_enum,
        profile_picture_url character varying(200) COLLATE pg_catalog."default",
        bio text COLLATE pg_catalog."default",
        CONSTRAINT user_profiles_pkey PRIMARY KEY (profile_id),
        CONSTRAINT user_profiles_user_id_fkey FOREIGN KEY (user_id)
            REFERENCES public.users (user_id) MATCH SIMPLE
            ON UPDATE NO ACTION
            ON DELETE SET NULL
    )`);
    await pool.query(`ALTER TABLE public.user_profiles OWNER TO ${process.env.PG_USER}`);

    },

    // Clears everything related to users inside the database.
    // In this case, the information about leagues and teams will persist.
    async clearUserDatabase() {
        await this.clearUser();
        await this.clearUserProfile();
        return;
    },

    // Remove the users database.
    async clearUser() {
        await pool.query('DROP TABLE users');
        return;
    },

    // Remove the user profiles database.
    async clearUserProfile() {
        await pool.query('DROP TABLE user_profiles');
        return;
    },


    // Initialize the database to default settings.
    async initializeTestDatabase() {
        await this.clearUserDatabase();
        await this.createUserDatabase();
        await this.createUserProfileDatabase();
    },

    async initializeDatabase() {
        await pool.query('DELETE FROM users');
        await pool.query('DELETE FROM user_profiles');
    },

}

module.exports = Utils;
