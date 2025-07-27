import app.schemas.types as api


class LobbyError(Exception):
    """Base exception for all lobby-related errors."""
    def __init__(self, message: str, detail: dict | None = None):
        super().__init__(message)
        self.detail = detail if detail is not None else {}

class LobbyNotFoundError(LobbyError):
    """Raised when a lobby with the given ID does not exist."""
    def __init__(self, lobby_id: api.LobbyId):
        super().__init__(f"Lobby '{lobby_id}' not found.")
        self.detail = {"lobby_id": lobby_id}

class LobbyPermissionError(LobbyError):
    """Raised when a non-host user tries performing host actions on lobby."""
    def __init__(self, user: api.UserProfile, lobby_id: api.LobbyId):
        super().__init__(f"User {user} does not have permission to manage Lobby '{lobby_id}'")
        self.detail = {
            "lobby_id": lobby_id,
            "user": user.model_dump(mode="json"),
        }

class LobbyAlreadyHostedError(LobbyError):
    """Raised when a user that is already hosting a lobby tries creating a new lobby."""
    def __init__(self, user: api.UserProfile, lobby_id: api.LobbyId):
        super().__init__(f"User {user} already hosting Lobby '{lobby_id}'")
        self.detail = {
            "lobby_id": lobby_id,
            "user": user.model_dump(mode="json"),
        }
