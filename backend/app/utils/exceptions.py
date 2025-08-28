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
        self.detail = {"lobby_id": lobby_id, "reson": "This lobby does not exist."}

class LobbyPermissionError(LobbyError):
    """Raised when a non-host user tries performing host actions on lobby."""
    def __init__(self, user: api.UserProfile, lobby_id: api.LobbyId):
        super().__init__(f"User {user} does not have permission to manage Lobby '{lobby_id}'")
        self.detail = {
            "lobby_id": lobby_id,
            "user": user.model_dump(mode="json"),
        }

class LobbyCreateError(LobbyError):
    """Raised when Lobby creation fails because user is in existing lobby."""
    def __init__(self, user: api.UserProfile, lobby_id: api.LobbyId):
        super().__init__(f"User {user} can't create new Lobby because user is already in Lobby '{lobby_id}'")
        self.detail = {
            "lobby_id": lobby_id,
            "user": user.model_dump(mode="json"),
        }

class LobbyJoinError(LobbyError):
    """Raised when a user can not join their requested lobby."""
    def __init__(self, user: api.UserProfile, lobby_id: api.LobbyId, reason: str = ""):
        super().__init__(f"User {user} can't join Lobby '{lobby_id}' because '{reason}'.")
        self.detail = {
            "lobby_id": lobby_id,
            "user": user.model_dump(mode="json"),
            "reason": reason,
        }

class LobbyLeaveError(LobbyError):
    """Raised when a user can not leave their requested lobby."""
    def __init__(self, user: api.UserProfile, lobby_id: api.LobbyId, reason: str = ""):
        super().__init__(f"User {user} can't leave Lobby '{lobby_id}' because '{reason}'.")
        self.detail = {
            "lobby_id": lobby_id,
            "user": user.model_dump(mode="json"),
            "reason": reason,
        }

class LobbyStartError(LobbyError):
    """Raised when a user a lobby can't be started"""
    def __init__(self, user: api.UserProfile, lobby_id: api.LobbyId, reason: str = ""):
        super().__init__(f"User {user} can't start Lobby '{lobby_id}' because '{reason}'.")
        self.detail = {
            "lobby_id": lobby_id,
            "user": user.model_dump(mode="json"),
            "reason": reason,
        }


class GameError(Exception):
    """Base exception for all lobby-related errors."""
    def __init__(self, message: str, detail: dict | None = None):
        super().__init__(message)
        self.detail = detail if detail is not None else {}
        
class IllegalMoveException(GameError):
    def __init__(self, message: str, detail: dict | None = None):
        super().__init__(message, detail)
        self.message = message