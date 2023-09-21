# discord-code-bot

Bot that send 1 promo code per valid role.

Type `/codes` to see your codes available.

Update `codes.json` with `roleId` and a list of codes.
See `users.json` to list all codes given to each users.

## Usage

* ```cp .env.example .env```
* Edit .env content
* ```yarn```
* ```yarn start``` => *Start the bot.*
* ```yarn build``` => *Build js files to /build.*
* ```yarn deploy-commands``` => *Deploy commands in scripts/deploy-commands.ts to the discord API.*