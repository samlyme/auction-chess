# exceptions.py

from typing import Any, Mapping
import backend.app.schemas.types as api


# ---------- Base types ----------

class LobbyError(Exception):
    """Base exception for all lobby-related errors."""

    def __init__(self, message: str, *, detail: Mapping[str, Any] | None = None):
        # Keep Exception(args) clean: one human-readable message.
        super().__init__(message)
        # Preserve an immutable-ish snapshot as a plain dict.
        self.detail: dict[str, Any] = dict(detail or {})


# ---------- Concrete lobby errors ----------

class LobbyNotFoundError(LobbyError, LookupError):
    """Raised when a lobby with the given ID does not exist."""

    def __init__(self, *, lobby_id: api.LobbyId):
        self.lobby_id = lobby_id
        super().__init__(
            f"Lobby '{lobby_id}' not found",
            detail={"lobby_id": lobby_id, "reason": "lobby_missing"},
        )


class LobbyPermissionError(LobbyError, PermissionError):
    """Raised when a non-host user attempts host-only actions."""

    def __init__(self, *, user: api.UserProfile, lobby_id: api.LobbyId):
        self.user_id = user
        self.lobby_id = lobby_id
        super().__init__(
            f"User '{user}' is not permitted to manage lobby '{lobby_id}'",
            detail={"lobby_id": lobby_id, "user": user, "reason": "not_host"},
        )


class LobbyCreateError(LobbyError):
    """Raised when lobby creation fails due to existing membership."""

    def __init__(self, *, user: api.UserProfile, existing_lobby_id: api.LobbyId):
        self.user_id = user
        self.existing_lobby_id = existing_lobby_id
        super().__init__(
            (
                f"User '{user}' cannot create a new lobby because they are already "
                f"in lobby '{existing_lobby_id}'"
            ),
            detail={
                "user": user,
                "existing_lobby_id": existing_lobby_id,
                "reason": "already_in_lobby",
            },
        )


class LobbyJoinError(LobbyError):
    """Raised when a user cannot join the requested lobby."""

    def __init__(self, *, user: api.UserProfile, lobby_id: api.LobbyId, reason: str | None = None):
        self.user_id = user
        self.lobby_id = lobby_id
        self.reason = reason
        msg = f"User '{user}' cannot join lobby '{lobby_id}'"
        if reason:
            msg += f": {reason}"
        super().__init__(msg, detail={"lobby_id": lobby_id, "user": user, "reason": reason})


class LobbyLeaveError(LobbyError):
    """Raised when a user cannot leave the requested lobby."""

    def __init__(self, *, user: api.UserProfile, lobby_id: api.LobbyId, reason: str | None = None):
        self.user_id = user
        self.lobby_id = lobby_id
        self.reason = reason
        msg = f"User '{user}' cannot leave lobby '{lobby_id}'"
        if reason:
            msg += f": {reason}"
        super().__init__(msg, detail={"lobby_id": lobby_id, "user": user, "reason": reason})


class LobbyStartError(LobbyError):
    """Raised when a lobby cannot be started."""

    def __init__(self, *, user: api.UserProfile, lobby_id: api.LobbyId, reason: str | None = None):
        self.user_id = user
        self.lobby_id = lobby_id
        self.reason = reason
        msg = f"User '{user}' cannot start lobby '{lobby_id}'"
        if reason:
            msg += f": {reason}"
        super().__init__(msg, detail={"lobby_id": lobby_id, "user": user, "reason": reason})


# ---------- Game errors ----------

class GameError(Exception):
    """Base exception for all game-related errors."""

    def __init__(self, message: str, *, detail: Mapping[str, Any] | None = None):
        super().__init__(message)
        self.detail: dict[str, Any] = dict(detail or {})


class IllegalMoveError(GameError, ValueError):
    """Raised when a move violates game rules."""

    def __init__(self, *, move: str | dict[str, Any], reason: str | None = None):
        self.move = move
        self.reason = reason
        msg = "Illegal move"
        # Keep message compact, attach specifics as attributes/detail.
        if reason:
            msg += f": {reason}"
        super().__init__(msg, detail={"move": move, "reason": reason})
