BEGIN;

-- CREATE TABLE "driver" ---------------------------------------
CREATE TABLE "public"."driver" ( 
	"dispatcher_rating_count" Double Precision DEFAULT 0 NOT NULL,
	"driver_license_back" Bytea DEFAULT '\x'::bytea NOT NULL,
	"driver_license_front" Bytea DEFAULT '\x'::bytea NOT NULL,
	"cumulative_dispatcher_rating" Numeric( 2, 1 ) DEFAULT '0' NOT NULL,
	"driver_id" Character Varying( 255 ) NOT NULL,
	"user_id" Character Varying( 255 ),
	"vehicle_id" Character Varying( 255 ),
	"driver_availability" Character Varying( 255 ) DEFAULT 'available'::character varying NOT NULL,
	PRIMARY KEY ( "driver_id" ) );
 ;
-- -------------------------------------------------------------

COMMIT;

BEGIN;

-- CREATE LINK "cardriver_vehicle_id_fkey" ---------------------
ALTER TABLE "public"."driver"
	ADD CONSTRAINT "cardriver_vehicle_id_fkey" FOREIGN KEY ( "vehicle_id" )
	REFERENCES "public"."vehicle" ( "vehicle_id" ) MATCH SIMPLE
	ON DELETE No Action
	ON UPDATE No Action;
-- -------------------------------------------------------------

COMMIT;

BEGIN;

-- CREATE LINK "car_driver_user_id_fkey" -----------------------
ALTER TABLE "public"."driver"
	ADD CONSTRAINT "car_driver_user_id_fkey" FOREIGN KEY ( "user_id" )
	REFERENCES "public"."users" ( "user_id" ) MATCH SIMPLE
	ON DELETE No Action
	ON UPDATE No Action;
-- -------------------------------------------------------------

COMMIT;
