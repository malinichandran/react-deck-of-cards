import React, { useState, useEffect, useRef } from 'react';
import axios from "axios";
import Card from "./Card";

const API_BASE_URL = "http://deckofcardsapi.com/api/deck";

const Deck = () => {
const [deck, setDeck] = useState(null);
const [drawn, setDrawn] = useState([]);
const [autoDraw, setAutoDraw] = useState(false);
const timerRef = useRef(null);

useEffect(() => {
    async function getData(){
        let d = await axios.get(`${API_BASE_URL}/new/shuffle/`);
        setDeck(d.data);
    }
    getData()
}, [setDeck]);

useEffect(() => {
    async function getCard(){
        let { deck_id } = deck;
        try{
            let drawRes = await axios.get(`${API_BASE_URL}/${deck_id}/draw/`);

            if(drawRes.data.remaining === 0){
                setAutoDraw(false);
                throw new Error("no card remaining!");
            }
            const card = drawRes.data.cards[0];

            setDrawn(d => [...d,
                        {
                            id: card.code,
                            name: card.suit + " " + card.value,
                            image: card.image
                        }
                    ]);
        } catch(err){
            alert(err);
        }
    }

    if (autoDraw && !timerRef.current){
        timerRef.current = setInterval(async()=>{
            await getCard();
        }, 1000);
    }
    return () => {
        clearInterval(timerRef.current);
        timerRef.current = null;
    };
}, [autoDraw, setAutoDraw, deck]);

const toggleAutoDraw = () => {
    setAutoDraw(auto => !auto);
};

const cards = drawn.map(c => (
    <Card key={c.id} name={c.name} image={c.image}/>
))

return(
    <div>
        {deck ? (
            <button onClick={toggleAutoDraw}>
                {autoDraw ? "STOP" : "KEEP"} DRAWING A CARD!
            </button>
        ) : null}
        <div>{cards}</div>
    </div>
)
}

export default Deck;