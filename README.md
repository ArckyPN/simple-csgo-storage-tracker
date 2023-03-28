# Simple CSGO Storage Unit Tracker

A simple local application to semi-automatically track your content and its value of your CSGO Storage Units.

## Table of Contents
- [Simple CSGO Storage Unit Tracker](#simple-csgo-storage-unit-tracker)
  - [Table of Contents](#table-of-contents)
  - [Requirements](#requirements)
  - [Setup](#setup)
    - [Preexisting Data Integration](#preexisting-data-integration)
  - [Hot to Use](#hot-to-use)
  - [Additional Notes](#additional-notes)

## Requirements
  - [Node.js](https://nodejs.org/en "Node.js webpage")
  - modern Browser, like Firefox, Chrome, Edge, etc.
  - Windows, Linux or Mac OS (any OS which can run JavaScript should work)

## Setup
1. Download the latest [release](https://github.com/ArckyPN/simple-csgo-storage-tracker/releases)
2. Save it to a location of choice
3. open the directory in a terminal
4. execute ``npm run install`` to install all dependencies
5. Optional: compile your preexisting data according to [this](#preexisting-data-integration)
6. execute ``npm run start`` to launch the application (your default browser will open)

### Preexisting Data Integration
If you already have any data on your Storage Units into ``storage.csv`` like so:

```csv
Name ; Quantity ; Purchase Price ; Unit Name
Sample Case ; 15 ; 0.23 ; Sample Unit 1
Sticker | Sample (Foil) ; 5 ; 0 ; Sample Unit 1
...
AK-47 | Sample Skin (Minimal Wear) ; 1 ; 420.69 ; Sample Unit 2
```
and then save it to root directory of the release folder (the same folder where you should see ``dist/``, ``node_modules/``, ``src/``, ``package.json``, etc.).

## Hot to Use
If you have completed the previous step and imported your preexisting data, all your data should be displayed as a table right away. If not, you can add new Items using the input form on the top left with its 4 input fields and the ``Add``-Button below.
In the Price @CS2 Announcement you may add any price you want manually (I have added the prices from the 22nd March'23, the day CS2 was announced).
With the ``Update All``-Button you should be able to fetch the current Steam Market prices of all your Items, however this usually takes a while (about 3.5s per item) or often fails, because of Steam API limitations.
I recommend you use the ``Update``-Button to update every Item of choice individually. 
**Keep in Mind: you can only updated about 20 prices per minute, before the Steam API blocks you for a few minutes!**
To delete Items from your table enter the ``Edit Mode`` using the corresponding button next to the other buttons.
With the ``Delete``-Button you are promted to input a amount of how many instances of the selected Item you want to delete. Leave the input empty or give a number greater or equaly the current number to delete the whole Item. Give a number less than the current number to remove only that many.

## Additional Notes
This is a very basic application is only meant as a makeshift solution while I am working on a proper website expanding the features of this tool, making it more visually pleasing and adding way more features.
If you are encountering any bugs please let me know through a [Issue](https://github.com/ArckyPN/simple-csgo-storage-tracker/issues) on this repository and I'll do my best to provide an updated version. Otherwise this application is its final form and won't receive other updates, unless I deem it necessary or worth while.