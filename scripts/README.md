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

Version 2.1.44

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

# NOTE: the path to the CSV file must be absolute!
importer = TextImporter(collection, '/path/to/file.csv')

# Map CSV fields; default is front, back, tags (if there's a third field)
importer.initMapping()

# (Optional) Set note type; see https://github.com/ankitects/anki/blob/main/ftl/core/notetypes.ftl
importer.model = collection.models.byName('Basic (and reversed card)')

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
