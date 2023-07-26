const pool = require('../src/config/db');

const Utils = {

    // Create a user database.
    async createUserDatabase() {
        await this.createSequenceIfNotExists(pool, 'users_user_id_seq');
        // await pool.query(`CACHE 1`);
        await pool.query(`ALTER SEQUENCE users_user_id_seq OWNER TO ${process.env.PG_USER}`);

        await pool.query(`CREATE TABLE IF NOT EXISTS public.users
        (
            user_id integer NOT NULL DEFAULT nextval('users_user_id_seq'::regclass),
            username character varying(50) COLLATE pg_catalog."default" NOT NULL,
            encrypted_password character varying(256) COLLATE pg_catalog."default" NOT NULL,
            created_at timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
            password_changed_at timestamp with time zone,
            logged_out_at timestamp with time zone,
            admin_status boolean NOT NULL DEFAULT false,
            email character varying(100) COLLATE pg_catalog."default",
            profile_id integer,
            CONSTRAINT users_pkey PRIMARY KEY (user_id),
            CONSTRAINT users_email_key UNIQUE (email)
        )`);
        await pool.query(`ALTER TABLE public.users OWNER to ${process.env.PG_USER}`);
    },

    async createUserProfileDatabase() {
        await this.createTypeIfNotExists(pool, 'gender_enum', ['Male', 'Female', 'Other']);
        await this.createTypeIfNotExists(pool, 'privacy_enum', ['public', 'friends_only', 'private']);
        await this.createSequenceIfNotExists(pool, 'user_profiles_profile_id_seq');
        // Continue with your queries...
        // await pool.query(`CACHE 1`);
        await pool.query(`ALTER SEQUENCE user_profiles_profile_id_seq OWNER TO ${process.env.PG_USER}`);

        await pool.query(`CREATE TABLE IF NOT EXISTS public.user_profiles
    (
        profile_id integer NOT NULL DEFAULT nextval('user_profiles_profile_id_seq'::regclass),
        user_id integer,
        name character varying(100) COLLATE pg_catalog."default" NOT NULL,
        birthdate date,
        age integer,
        sex gender_enum NOT NULL DEFAULT 'Other',
        privacy_setting privacy_enum NOT NULL DEFAULT 'public',
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

    async createFriendDatabase() {
        await this.createTypeIfNotExists(pool, 'friend_status_enum', ['pending', 'accepted', 'rejected', 'blocked']);

        /** Create the table. */
        await pool.query(`CREATE TABLE friends (
            friendship_id SERIAL PRIMARY KEY,
            user_id_1 INT NOT NULL,
            user_id_2 INT NOT NULL,
            status friend_status_enum NOT NULL,
            timestamp TIMESTAMP NOT NULL DEFAULT NOW()
        )`);

        await pool.query(`ALTER TABLE public.friends OWNER TO ${process.env.PG_USER}`);
    },

    async createTypeIfNotExists(pool, typeName, values) {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            const typeExists = await client.query(
                `SELECT 1 FROM pg_type WHERE typname = $1`, [typeName]
            );

            if (typeExists.rowCount === 0) {
                await client.query(`CREATE TYPE ${typeName} AS ENUM (${values.map(value => `'${value}'`).join(", ")});`);
            }
            await client.query('COMMIT');
        } catch (e) {
            await client.query('ROLLBACK');
            throw e;
        } finally {
            client.release();
        }
    },

    async createSequenceIfNotExists(pool, sequenceName) {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            const sequenceExists = await client.query(
                `SELECT 1 FROM information_schema.sequences WHERE sequence_name = $1`, [sequenceName]
            );

            if (sequenceExists.rowCount === 0) {
                await client.query(`
                CREATE SEQUENCE ${sequenceName}
                    START WITH 1
                    INCREMENT BY 1
                    NO MINVALUE
                    NO MAXVALUE`);
                await client.query(`ALTER SEQUENCE ${sequenceName} OWNER TO ${process.env.PG_USER}`);
            }
            await client.query('COMMIT');
        } catch (e) {
            await client.query('ROLLBACK');
            throw e;
        } finally {
            client.release();
        }
    },

    // Clears everything related to users inside the database.
    // In this case, the information about leagues and teams will persist.
    async clearUserDatabase() {
        await pool.query('DROP TABLE users, user_profiles, friends CASCADE');
        return;
    },

    // Initialize the database to default settings.
    async initializeTestDatabase() {
        await this.createUserDatabase();
        await this.createUserProfileDatabase();
        await this.createFriendDatabase();
    },

    async initializeDatabase() {
        await pool.query('DELETE FROM users');
        await pool.query('DELETE FROM user_profiles');
        await pool.query('DELETE FROM friends');
    },

}

module.exports = Utils;
