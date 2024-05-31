BEGIN;

-- CREATE TABLE "vehicle" --------------------------------------
CREATE TABLE "public"."vehicle" ( 
	"vehicle_id" Character Varying( 255 ) NOT NULL,
	"vehicle_name" Character Varying( 100 ) NOT NULL,
	"vehicle_model" Character Varying( 100 ) NOT NULL,
	"plate_number" Character Varying( 50 ) NOT NULL,
	"vehicle_type" Character Varying( 100 ) DEFAULT 'motor'::character varying NOT NULL,
	"insurance_details" Character Varying( 255 ) DEFAULT 'not insured'::character varying NOT NULL,
	"road_worthy" Character Varying( 255 ) DEFAULT 'no road worthy'::character varying NOT NULL,
	PRIMARY KEY ( "vehicle_id" ) );
 ;
-- -------------------------------------------------------------

COMMIT;
