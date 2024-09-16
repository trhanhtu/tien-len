DROP SCHEMA IF EXISTS sm_game CASCADE;


CREATE SCHEMA sm_game;


-- Table for players

CREATE TABLE sm_game.tb_player_cards (
email VARCHAR(100) NOT NULL auth.users.email PRIMARY KEY,
cards SMALLINT[] NOT NULL DEFAULT '{}');

-- Table for matches

CREATE TABLE sm_game.tb_match (
match_id SERIAL NOT NULL PRIMARY KEY,
attack_type SMALLINT DEFAULT 0 NOT NULL,
score INTEGER DEFAULT 0 NOT NULL,
who_turn SMALLINT DEFAULT 0 NOT NULL,
players_email_array VARCHAR(100)[] NOT NULL DEFAULT '{}' CHECK (array_length(players_email_array, 1) <= 4),
players_state_array CHAR(3)[] NOT NULL DEFAULT '{"ide","out", "out", "out"}' CHECK (array_length(players_state_array, 1) <= 4),

CREATE TABLE sm_game.tb_match_broadcast(
    match_id INTEGER NOT NULL REFERENCES sm.tb_match(match_id),
    command TEXT NOT NULL DEFAULT 'new'
)

CREATE OR REPLACE FUNCTION sm_game.create_player_on_auth_insert() RETURNS TRIGGER
set search_path = '' AS $$
BEGIN
    INSERT INTO sm_game.tb_player_cards (email)
    VALUES (NEW.email);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;


CREATE TRIGGER create_player_trigger AFTER
INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION sm_game.create_player_on_auth_insert();


ALTER TABLE sm_game.tb_player_cards ENABLE ROW LEVEL SECURITY;

-- Policy for tb_player_cards

CREATE POLICY select_own_player ON sm_game.tb_player_cards
FOR
SELECT USING (
                  (SELECT auth.email()) = id);

-- Create a policy for INSERT operations with a WITH CHECK condition
-- Update policy for players table

CREATE POLICY update_player_policy ON sm_game.tb_player_cards
FOR
UPDATE WITH CHECK (
                       (SELECT auth.email()) = id);

-- Insert policy for players table

CREATE POLICY insert_player_policy ON sm_game.tb_player_cards
FOR
INSERT WITH CHECK (true);

-- Insert policy for match table

CREATE POLICY insert_match_policy ON sm_game.tb_match
FOR
INSERT WITH CHECK (NOT (
                            (SELECT auth.email()) = ANY(players_email_array)));

-- Update policy for match table

CREATE POLICY update_match_policy ON sm_game.tb_match
FOR
UPDATE USING (
                  (SELECT auth.email()) = ANY(players_email_array));

-- Select policy for match table

CREATE POLICY select_own_match ON sm_game.tb_match
FOR
SELECT USING (
                  (SELECT auth.email()) = ANY(players_email_array));


CREATE OR REPLACE VIEW sm_game.v_get_room_info AS
SELECT match_id,
       players_email_array[1] AS email,
       array_length(players_id_array, 1) AS player_count
FROM sm_game.tb_match
WHERE array_length(players_email_array, 1) != 0;

GRANT
SELECT ON sm_game.v_get_room_info TO authenticated;


CREATE OR REPLACE FUNCTION sm_game.func_create_match_if_not_in_any() 
RETURNS INTEGER
SET search_path = '' AS $$
DECLARE
    _room_id_value INTEGER;
    player_email VARCHAR(100) := auth.email();
BEGIN
    -- Check if the player is already in a match
    IF EXISTS (
        SELECT 1 FROM sm_game.tb_match WHERE player_email = ANY(players_email_array)
    ) THEN
        RETURN -1; -- Return -1 if player is already in a match
    END IF;

    -- Find an empty room
    SELECT match_id 
    FROM sm_game.tb_match 
    WHERE array_length(players_email_array, 1) = 0 
    LIMIT 1 INTO _room_id_value;

    IF _room_id_value IS NOT NULL THEN
        -- Update the existing match with the player
        UPDATE sm_game.tb_match 
        SET players_email_array = ARRAY[player_email], 
            players_state_array = ARRAY['ide','out','out','out'] 
        WHERE match_id = _room_id_value;

        UPDATE sm_game.tb_match_broadcast
        SET command = 'new'
    ELSE
        -- Create a new match and add the player
        INSERT INTO sm_game.tb_match (players_email_array, players_state_array)
        VALUES (ARRAY[player_email], ARRAY['ide','out','out','out'])
        RETURNING match_id INTO _room_id_value;

        INSERT INTO sm_game.tb_match_broadcast(match_id) VALUES (_room_id_value)
    END IF;

    RETURN _room_id_value; -- Return the match ID (either existing or new)
END;
$$ LANGUAGE plpgsql;





CREATE OR REPLACE FUNCTION sm_game.func_exit_match_if_in_any() RETURNS VOID
SET search_path = '' AS $$
DECLARE
    _room_id_value INTEGER;
    _player_position INTEGER;
    player_email VARCHAR(100) := auth.email();
BEGIN
    -- Check if the player is in the specified match
    SELECT match_id , array_position(players_email_array, player_email)
    FROM sm_game.tb_match
    WHERE player_email = ANY(players_email_array)
    INTO _room_id_value , _player_position;

    IF _room_id_value IS NOT NULL THEN
        -- Remove the player from the match

        UPDATE sm_game.tb_match
        SET players_email_array = array_remove(players_email_array, player_email),
        players_state_array = player
        WHERE match_id = _room_id_value;
    END IF;
END;
$$ LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION sm_game.func_join_match_if_not_in_any(player_id UUID, player_email VARCHAR(100), _match_id INT) RETURNS VOID
set search_path = '' AS $$
BEGIN
    -- Check if the player is already in a match
    IF NOT EXISTS (
        SELECT 1 FROM sm_game.tb_match WHERE player_id = ANY(players_email_array)
    ) THEN
        -- Add the player to the specified match
        UPDATE sm_game.tb_match
        SET players_id_array = array_append(players_id_array, player_id),
            players_email_array = array_append(players_email_array, player_email)
        WHERE match_id = _match_id;
    ELSE
        RAISE ERROR 'Player is already in a match';
    END IF;
END;
$$ LANGUAGE plpgsql;

GRANT USAGE ON SCHEMA sm_game TO authenticated;

GRANT USAGE ON SCHEMA sm_game TO supabase_auth_admin;

GRANT USAGE ON SCHEMA sm_game TO postgres;

GRANT ALL PRIVILEGES ON TABLE sm_game.tb_player_cards TO supabase_auth_admin;

GRANT ALL PRIVILEGES ON TABLE sm_game.tb_player_cards TO postgres;

GRANT EXECUTE ON FUNCTION sm_game.create_player_on_auth_insert TO supabase_auth_admin;

GRANT EXECUTE ON FUNCTION sm_game.create_player_on_auth_insert TO postgres;

GRANT ALL PRIVILEGES ON TABLE sm_game.tb_match TO authenticated;

GRANT USAGE,
SELECT ON SEQUENCE sm_game.tb_match_match_id_seq TO authenticated;

