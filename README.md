#### Entering mixed text for Arabic flash cards

[https://stackoverflow.com/a/51306875/399105](https://stackoverflow.com/a/51306875/399105)


#### Combining chapters/units

```
cd scripts
npm install
npm start combine-chapters.ts ../mastering-arabic-1-3rd-edition/*.csv
```


#### Convert CSV to Anki apkg file

[https://apps.ankiweb.net/docs/manual.html#importing](https://apps.ankiweb.net/docs/manual.html#importing)

1. Download and install [Anki desktop app](https://apps.ankiweb.net/)

2. Open Anki

3. Click *Create Deck*, give it a name, *OK*

4. Click *Import File*

5. Select the CSV file to import

6. Select *Type*. For example, select *Basic (and reversed card)* to have Anki automatically create reverse cards for you

7. Select the *Deck* you created to put it in

8. Select a duplicate strategy. For example, select *Import even if existing note has same first field* if you don't want Anki to handle duplicates

9. Click *Import*

10. Click the options icon near the deck > *Export*

11. Uncheck *Include scheduling information* if this deck is for sharing with others

12. Click *Export*

13. Optionally, click the sync button near the top right to sync to AnkiWeb
