import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Player } from "./game/State";

export const ScrollToTop = () => {
    const { pathname, hash, key } = useLocation();

    useEffect(() => {
        if (hash === '') {
            window.scrollTo(0, 0);
        }
        else {
            setTimeout(() => {
                const id = decodeURIComponent(hash.replace('#', ''));
                const element = document.getElementById(id);
                if (element) {
                    element.scrollIntoView();
                }
            }, 0);
        }
    }, [pathname, hash, key]);

    return null;
};

export const extractJSON = (str: string) => {
    let firstOpen, firstClose, candidate;
    firstOpen = 0;
    firstOpen = str.indexOf('{', firstOpen + 1);
    do {
        firstClose = str.lastIndexOf('}');
        console.log('firstOpen: ' + firstOpen, 'firstClose: ' + firstClose);
        if (firstClose <= firstOpen) {
            return null;
        }
        do {
            candidate = str.substring(firstOpen, firstClose + 1);
            console.log('candidate: ' + candidate);
            try {
                const res = JSON.parse(candidate) as unknown;
                console.log('...found');
                return res;
            }
            catch (e) {
                console.log('...failed');
            }
            firstClose = str.substr(0, firstClose).lastIndexOf('}');
        } while (firstClose > firstOpen);
        firstOpen = str.indexOf('{', firstOpen + 1);
    } while (firstOpen !== -1);
}

export const unreachable = (x: never): any => {};

export const swapUIDForName = (text: string, players: Player[]) => {
    for (const player of players) {
        text = text.replace(new RegExp(player.uid, 'g'), player.name);
    }
    return text;
};