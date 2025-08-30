import { useAuthContext } from "../contexts/Auth";
import { useServerUpdatesContext } from "../contexts/ServerUpdates";
import useGame from "../hooks/useGame";
import type { Color, UserProfile } from "../schemas/types";

function Menu(){
    const { lobby } = useServerUpdatesContext()
    const { user } = useAuthContext()
    const { userColor, opponentColor, userBalance, opponentBalance} = useGame()

    if (!lobby || !user) return (
        <div>Loading</div>
    )

    const opponentProfile: UserProfile | null = userColor == "w" ? lobby.guest : lobby.host

    return (
        <div className="menu">
            {
                opponentProfile
                ?   <PlayerProfile 
                        username={opponentProfile.username}
                        color={opponentColor}
                        balance={opponentBalance}
                    />
                :   <div>disconnected</div>
            }

            <BiddingMenu />

            <PlayerProfile 
                username={user.username}
                color={userColor}
                balance={userBalance}
            />
        </div>
    )
}

function PlayerProfile({ username, color, balance }: { username: string, color: Color, balance: number}) {
    return (
        <div className="player-profile">
            <h2>{username} <i>({color == "w" ? "white" : "black"})</i></h2>

            <h4>Balance:</h4>
            <h1>${balance}</h1>
        </div>
    )
}

function BiddingMenu() {
    return (
        <div className="bidding-menu">
            <h4>Last bid: $</h4>

            <div>
                <input type="text" placeholder="Bid amount"/>
            </div>


            <div>
                <button>+1</button>
                <button>+5</button>
                <button>+20</button>
            </div>

            <div>
                <button>Bid</button>
                <button>Fold</button>
            </div>
        </div>
    )
}

export default Menu;