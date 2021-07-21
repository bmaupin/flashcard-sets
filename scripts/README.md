# Scripts

#### Combining chapters/units

```
npm install
npm start combine-chapters.ts ../arabic/mastering-arabic-1-3rd-edition/*.csv
```

#### Generate .apkg files from .csv files

```
pip3 install anki protobuf
python csv-to-apkg.py INPUT.csv OUTPUT.apkg
```

# Anki API

Some unofficial documentation for the official Anki API, based on version 2.1.44

The official documentation seems to be here: [Writing Anki Add-ons](https://addon-docs.ankiweb.net/getting-started.html)

## Installation

```
pip3 install anki protobuf
```

## Collections

#### Create a new collection

```python
# NOTE: The path to the collection must be absolute!
# NOTE: This will change the current path
collection = anki.Collection('/path/to/collection.anki2')
```

The collection will contain one deck named `Default`

#### Import a CSV file into a collection

([https://github.com/ankitects/anki/blob/main/pylib/anki/importing/csvfile.py](https://github.com/ankitects/anki/blob/main/pylib/anki/importing/csvfile.py))

```python
from anki.importing.csvfile import TextImporter

# (Optional) Create a deck with a new name; otherwise the "Default" deck will be used
deck_id = collection.decks.id('Deck name')

# Set note type; see https://github.com/ankitects/anki/blob/main/ftl/core/notetypes.ftl
# NOTE: This is required when creating a deck with a new name (above), otherwise it's optional
model = collection.models.byName('Basic (and reversed card)')

# This is necessary so that the import saves new cards into the new deck we just created (only necessary when creating a deck with a new name)
model['did'] = deck_id

# Save above changes to the model (again, only necessary when changing the note type or creating a deck with a new name)
# NOTE: This is required when making changes to the model (above), otherwise it's optional
collection.models.save(model)

# NOTE: the path to the CSV file must be absolute!
importer = TextImporter(collection, '/path/to/file.csv')

# Map CSV fields; default is front, back, tags (if there's a third field)
importer.initMapping()

# (Optional) set the import mode; seehttps://github.com/ankitects/anki/blob/main/pylib/anki/importing/noteimp.py
importer.importMode = anki.importing.noteimp.ADD_MODE

# (Optional) Allow HTML in fields
importer.allowHTML = True

# Import notes (cards) into the collection
importer.run()
```

#### Export a collection to an apkg file

([https://github.com/ankitects/anki/blob/main/pylib/anki/exporting.py](https://github.com/ankitects/anki/blob/main/pylib/anki/exporting.py))

```python
from anki.exporting import AnkiPackageExporter

# The collection needs to be saved before it can be exported
collection.save()

exporter = AnkiPackageExporter(collection)
# NOTE: the path to the package must be absolute!
exporter.exportInto('/path/to/collection.apkg')
```

## Decks

#### Return the deck

```python
collection.decks.get(1)
```

```python
collection.decks.byName('Default')
```

```python
collection.decks.current()
```

#### Return the current deck ID

```python
collection.decks.selected()
```

#### Get the ID of a deck by name (or create the deck if it doesn't exist)

```python
collection.decks.id('Default')
```

#### Return the name of a deck

```python
collection.decks.get(1)['name']
```

```python
collection.decks.name(1)
```

#### Return the name of the current deck

```python
collection.decks.name(collection.decks.selected())
```

#### Rename the current deck

```python
collection.decks.rename(collection.decks.current(), 'test name')
```

#### Rename a deck by ID

```python
collection.decks.rename(collection.decks.get(1), 'new new name2')
```

Or:

```python
deck = collection.decks.get(deck_id)
deck['name'] = 'Decky McDeckson'
collection.decks.save(deck)
```

#### Set the description of a deck

```python
deck = collection.decks.get(deck_id)
deck['desc'] = 'Descriptive description'
collection.decks.save(deck)
```
