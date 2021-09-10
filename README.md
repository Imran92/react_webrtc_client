This is a webRTC based peer to peer tank battle game. 

Here two person can join and battle one another by shooting shells to one another by hitting spacebars and try to hit, they can also move using the arrow keys. 

Both person can see each other's bullets and movements in real time and the score is also real time. The data is transfarred using webRTC. Currrently the game works best if both of the players are using above 768p displays

The front part is made with React. The backend Signaling Server is made with NodeJS.

For NAT Traversal, we've used Stun and as media proxy, we've used Coturn as the Turn server.
