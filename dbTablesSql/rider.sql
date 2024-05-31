BEGIN;

-- CREATE TABLE "rider" ----------------------------------------
CREATE TABLE "public"."rider" ( 
	"rider_rating_count" Double Precision DEFAULT 0 NOT NULL,
	"rider_license_front" Bytea DEFAULT '\x'::bytea NOT NULL,
	"rider_license_back" Bytea DEFAULT '\x'::bytea NOT NULL,
	"cumulative_rider_rating" Numeric( 2, 1 ) DEFAULT '0' NOT NULL,
	"rider_id" Character Varying( 255 ) NOT NULL,
	"vehicle_id" Character Varying( 255 ),
	"user_id" Character Varying( 255 ),
	"rider_availability" Character Varying( 255 ) DEFAULT 'available'::character varying NOT NULL,
	PRIMARY KEY ( "rider_id" ) );
 ;
-- -------------------------------------------------------------

COMMIT;

BEGIN;

-- CREATE LINK "motorrider_vehicle_id_fkey" --------------------
ALTER TABLE "public"."rider"
	ADD CONSTRAINT "motorrider_vehicle_id_fkey" FOREIGN KEY ( "vehicle_id" )
	REFERENCES "public"."vehicle" ( "vehicle_id" ) MATCH SIMPLE
	ON DELETE No Action
	ON UPDATE No Action;
-- -------------------------------------------------------------

COMMIT;

BEGIN;

-- CREATE LINK "motor_rider_user_id_fkey" ----------------------
ALTER TABLE "public"."rider"
	ADD CONSTRAINT "motor_rider_user_id_fkey" FOREIGN KEY ( "user_id" )
	REFERENCES "public"."users" ( "user_id" ) MATCH SIMPLE
	ON DELETE No Action
	ON UPDATE No Action;
-- -------------------------------------------------------------

COMMIT;
