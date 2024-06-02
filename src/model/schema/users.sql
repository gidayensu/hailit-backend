BEGIN;

-- CREATE TABLE "users" ----------------------------------------
CREATE TABLE "public"."users" ( 
	"date_updated" Timestamp With Time Zone DEFAULT now() NOT NULL,
	"date_created" Timestamp With Time Zone DEFAULT now() NOT NULL,
	"onboard" Boolean DEFAULT 'false',
	"email" Character Varying( 100 ) DEFAULT 'no email'::character varying NOT NULL,
	"user_id" Character Varying( 255 ) NOT NULL,
	"user_role" Character Varying( 50 ) DEFAULT 'customer'::character varying NOT NULL,
	"phone_number" Character Varying( 20 ) DEFAULT '0' NOT NULL,
	"first_name" Character Varying( 100 ) DEFAULT 'unknown'::character varying NOT NULL,
	"last_name" Character Varying( 100 ) DEFAULT 'unknown'::character varying NOT NULL,
	PRIMARY KEY ( "user_id" ),
	CONSTRAINT "user_email_key" UNIQUE( "email" ) );
 ;
-- -------------------------------------------------------------

COMMIT;
