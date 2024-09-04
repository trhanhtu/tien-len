DROP SCHEMA IF EXISTS sm_Game CASCADE;

CREATE SCHEMA sm_Game;

CREATE ROLE ro_player;
GRANT USAGE ON SCHEMA sm_Game TO ro_player;
ALTER ROLE ro_player SET search_path = sm_Game;

-- Table for players
CREATE TABLE sm_Game.tb_players (
    id UUID NOT NULL PRIMARY KEY,
    email VARCHAR(100) NOT NULL,
    cards INTEGER[] NOT NULL DEFAULT '{}'
);

-- Table for matches
CREATE TABLE sm_Game.tb_match (
    match_id SERIAL NOT NULL PRIMARY KEY,
    type SMALLINT DEFAULT 0 NOT NULL,
    score INTEGER DEFAULT 0 NOT NULL,
    who_turn SMALLINT DEFAULT 1 NOT NULL,
    players_id UUID[] NOT NULL,
    players_email VARCHAR(100)[] NOT NULL
    state char(27) not null default 'ide,out,out,out,-1,-1,-1,-1'
);

CREATE OR REPLACE FUNCTION sm_Game.create_player_on_auth_insert()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO sm_Game.tb_players (id, email)
    VALUES (NEW.id, NEW.email);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER create_player_trigger
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION sm_Game.create_player_on_auth_insert();


ALTER TABLE sm_Game.tb_players ENABLE ROW LEVEL SECURITY;
-- Policy for tb_players
CREATE POLICY select_own_player ON sm_Game.tb_players
    FOR SELECT
    USING (auth.uid() = id);


CREATE OR REPLACE VIEW sm_Game.v_get_room_info AS
SELECT 
    match_id,
    players_email[1] AS email,
    array_length(players_id, 1) AS player_count
FROM 
    sm_Game.tb_match
WHERE 
    array_length(players_id, 1) != 0;

CREATE OR REPLACE FUNCTION sm_Game.func_create_match_if_not_in_any(player_id UUID, player_email VARCHAR(100))
RETURNS VOID AS $$
BEGIN
    -- Check if the player is already in a match
    IF NOT EXISTS (
        SELECT 1 FROM sm_Game.tb_match WHERE player_id = ANY(players_id)
    ) THEN
        -- Create a new match and add the player
        INSERT INTO sm_Game.tb_match (players_id, players_email)
        VALUES (ARRAY[player_id], ARRAY[player_email]);
    ELSE
        RAISE NOTICE 'Player is already in a match';
    END IF;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION sm_Game.func_join_match_if_not_in_any(player_id UUID, player_email VARCHAR(100), match_id INT)
RETURNS VOID AS $$
BEGIN
    -- Check if the player is already in a match
    IF NOT EXISTS (
        SELECT 1 FROM sm_Game.tb_match WHERE player_id = ANY(players_id)
    ) THEN
        -- Add the player to the specified match
        UPDATE sm_Game.tb_match
        SET players_id = array_append(players_id, player_id),
            players_email = array_append(players_email, player_email)
        WHERE match_id = match_id;
    ELSE
        RAISE NOTICE 'Player is already in a match';
    END IF;
END;
$$ LANGUAGE plpgsql;

