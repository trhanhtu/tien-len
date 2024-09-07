DROP SCHEMA IF EXISTS sm_game CASCADE;


CREATE SCHEMA sm_game;

-- thử xóa 1 2 dòng grant xem cái nào dư

ALTER ROLE ro_player
SET search_path = sm_game;

-- Table for players

CREATE TABLE sm_game.tb_players (id UUID NOT NULL references auth.users PRIMARY KEY,
                                                                                email VARCHAR(100) NOT NULL,
                                                                                                   cards INTEGER[] NOT NULL DEFAULT '{}');

-- Table for matches

CREATE TABLE sm_game.tb_match ( 
    match_id SERIAL NOT NULL PRIMARY KEY,
    attack_type SMALLINT DEFAULT 0 NOT NULL,
    score INTEGER DEFAULT 0 NOT NULL,
    who_turn SMALLINT DEFAULT 0 NOT NULL,
    players_id_array UUID[] NOT NULL DEFAULT '{}' CHECK (array_length(players_id_array, 1) <= 4), 
    players_email_array VARCHAR(100)[] NOT NULL DEFAULT '{}' CHECK (array_length(players_email_array, 1) <= 4), 
    players_cards_array SMALLINT[] DEFAULT '{-1,-1,-1,-1}' NOT NULL CHECK (array_length(players_cards_array, 1) <= 4), 
    players_state_array CHAR(3)[] NOT NULL DEFAULT '{"ide","out", "out", "out"}' CHECK (array_length(players_state_array, 1) <= 4),
    players_ping_array SMALLINT[] DEFAULT '{0,0,0,0}' NOT NULL CHECK (array_length(players_ping_array, 1) <= 4));


CREATE OR REPLACE FUNCTION sm_game.create_player_on_auth_insert() RETURNS TRIGGER set search_path = '' AS $$
BEGIN
RAISE LOG 'Current user: %', current_user;
    INSERT INTO sm_game.tb_players (id, email)
    VALUES (NEW.id, NEW.email);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;


CREATE TRIGGER create_player_trigger AFTER
INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION sm_game.create_player_on_auth_insert();


ALTER TABLE sm_game.tb_players ENABLE ROW LEVEL SECURITY;

-- Policy for tb_players

CREATE POLICY select_own_player ON sm_game.tb_players
FOR
SELECT USING ((SELECT auth.uid()) = id);

-- Create a policy for INSERT operations with a WITH CHECK condition
-- Update policy for players table
CREATE POLICY update_player_policy ON sm_game.tb_players
FOR
UPDATE WITH CHECK ((SELECT auth.uid()) = id);

-- Insert policy for players table
CREATE POLICY insert_player_policy ON sm_game.tb_players
FOR
INSERT WITH CHECK (true);

-- Insert policy for match table
CREATE POLICY insert_match_policy ON sm_game.tb_match
FOR
INSERT WITH CHECK (NOT ((SELECT auth.uid()) = ANY(players_id_array)));

-- Update policy for match table
CREATE POLICY update_match_policy ON sm_game.tb_match
FOR
UPDATE USING ((SELECT auth.uid()) = ANY(players_id_array));

-- Select policy for match table
CREATE POLICY select_own_match ON sm_game.tb_match
FOR
SELECT USING ((SELECT auth.uid()) = ANY(players_id_array));


CREATE OR REPLACE VIEW sm_game.v_get_room_info AS
SELECT match_id,
       players_email_array[1] AS email,
       array_length(players_id_array, 1) AS player_count
FROM sm_game.tb_match
WHERE array_length(players_id_array, 1) != 0;

GRANT
SELECT ON sm_game.v_get_room_info TO authenticated;


CREATE OR REPLACE FUNCTION sm_game.func_create_match_if_not_in_any(player_id UUID, player_email VARCHAR(100)) RETURNS VOID set search_path = '' AS $$
BEGIN
    -- Check if the player is already in a match
    IF NOT EXISTS (
        SELECT 1 FROM sm_game.tb_match WHERE player_id = ANY(players_id_array)
    ) THEN
        -- Create a new match and add the player
        INSERT INTO sm_game.tb_match (players_id_array, players_email_array)
        VALUES (ARRAY[player_id], ARRAY[player_email]);
    ELSE
        RAISE NOTICE 'Player is already in a match';
    END IF;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION sm_game.func_exit_match_if_in_any(_match_id INT, player_id UUID, player_email VARCHAR(100)) 
RETURNS VOID 
SET search_path = '' 
AS $$
BEGIN
    -- Check if the player is in the specified match
    IF EXISTS (
        SELECT 1 
        FROM sm_game.tb_match 
        WHERE match_id = _match_id
        AND player_id = ANY(players_id_array)
    ) THEN
        -- Remove the player from the match
        UPDATE sm_game.tb_match
        SET players_id_array = array_remove(players_id_array, player_id),
            players_email_array = array_remove(players_email_array, player_email)
        WHERE match_id = _match_id;
    END IF;
END;
$$ LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION sm_game.func_join_match_if_not_in_any(player_id UUID, player_email VARCHAR(100), _match_id INT) RETURNS VOID set search_path = '' AS $$
BEGIN
    -- Check if the player is already in a match
    IF NOT EXISTS (
        SELECT 1 FROM sm_game.tb_match WHERE player_id = ANY(players_id_array)
    ) THEN
        -- Add the player to the specified match
        UPDATE sm_game.tb_match
        SET players_id_array = array_append(players_id_array, player_id),
            players_email_array = array_append(players_email_array, player_email)
        WHERE match_id = _match_id;
    ELSE
        RAISE NOTICE 'Player is already in a match';
    END IF;
END;
$$ LANGUAGE plpgsql;

GRANT USAGE ON SCHEMA sm_game TO authenticated;

GRANT USAGE ON SCHEMA sm_game TO supabase_auth_admin;

GRANT USAGE ON SCHEMA sm_game TO postgres;

GRANT ALL PRIVILEGES ON TABLE sm_game.tb_players TO supabase_auth_admin;

GRANT ALL PRIVILEGES ON TABLE sm_game.tb_players TO postgres;

GRANT EXECUTE ON FUNCTION sm_game.create_player_on_auth_insert TO supabase_auth_admin;

GRANT EXECUTE ON FUNCTION sm_game.create_player_on_auth_insert TO postgres;

GRANT ALL PRIVILEGES ON TABLE sm_game.tb_match TO authenticated;

GRANT USAGE,
SELECT ON SEQUENCE sm_game.tb_match_match_id_seq TO authenticated;
