const pool = require('../src/config/db');

const Utils = {

    // Create a user database.
    async createUserDatabase() {
        await this.createTypeIfNotExists(pool, 'gender_enum', ['Male', 'Female']);
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
        sex gender_enum,
        private boolean NOT NULL DEFAULT false,
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

    async createTypeIfNotExists(pool, typeName, values) {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            const typeExists = await client.query(
                `SELECT 1 FROM pg_type WHERE typname = $1`, [typeName]
            );
    
            if(typeExists.rowCount === 0) {
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
    
            if(sequenceExists.rowCount === 0) {
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
        await pool.query('DROP TABLE users, user_profiles CASCADE');
        return;
    },

    // Initialize the database to default settings.
    async initializeTestDatabase() {
        await this.createUserDatabase();
        await this.createUserProfileDatabase();
    },

    async initializeDatabase() {
        await pool.query('DELETE FROM users');
        await pool.query('DELETE FROM user_profiles');
    },

}

module.exports = Utils;
