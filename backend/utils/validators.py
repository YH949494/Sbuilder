VALID_SLOT_IDS = {"HP1", "HP2", "LP1", "LP2", "LP3", "LP4", "WILD", "SCAT"}
VALID_SHELLS   = {"shell_5x3_243ways", "shell_5x3_holdwin", "shell_5x3_bonusgame"}


def validate_slot_id(slot_id: str) -> bool:
    return slot_id in VALID_SLOT_IDS


def validate_shell(shell: str) -> bool:
    return shell in VALID_SHELLS


def validate_game_config(config: dict) -> list[str]:
    errors = []
    if not config.get("game_title"):
        errors.append("game_title is required")
    shell = config.get("shell")
    if shell and not validate_shell(shell):
        errors.append(f"Unknown shell: {shell}")
    return errors
