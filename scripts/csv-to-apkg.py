import os
import sys
import tempfile

import anki
from anki.exporting import AnkiPackageExporter
from anki.importing.csvfile import TextImporter

if len(sys.argv) < 3:
    sys.exit('Usage: {0} INPUT.csv OUTPUT.apkg'.format(sys.argv[0]))

csv_file = os.path.abspath(sys.argv[1])
apkg_file = os.path.abspath(sys.argv[2])

temp_dir = tempfile.gettempdir()

collection = anki.Collection(os.path.join(temp_dir, 'collection.anki2'))

# Create a new deck in the collection
# TODO: collection.name() is "colletion"
deck_id = collection.decks.id(collection.name())

# Switch to that deck
collection.decks.select(deck_id)

# Set note type to Basic (and reversed card)
model = collection.models.byName('Basic (and reversed card)')

# This is necessary so that the import saves new cards into the new deck we just created
model['did'] = deck_id

# Save above changes to the model
collection.models.save(model)

# TODO: can we add a deck description (e.g. from README)?

importer = TextImporter(collection, csv_file)
print('importer.fields: {0}'.format(importer.fields))
print('importer.mapping: {0}'.format(importer.mapping))
print('importer.delimiter: {0}'.format(importer.delimiter))
print('importer.foreignNotes(): {0}'.format(len(importer.foreignNotes())))
print()
# Map CSV fields; default is front, back, tags (if there's a third field)
importer.initMapping()
print('importer.fields: {0}'.format(importer.fields))
print('importer.mapping: {0}'.format(importer.mapping))
print('importer.delimiter: {0}'.format(importer.delimiter))
print('importer.foreignNotes(): {0}'.format(len(importer.foreignNotes())))

# Ignore duplicates
importer.importMode = anki.importing.noteimp.ADD_MODE

# Allow HTML in fields
importer.allowHTML = True

# Import notes (cards) into the collection
importer.run()

# The collection needs to be saved before it can be exported
collection.save()

# Export to apkg
exporter = AnkiPackageExporter(collection)
exporter.exportInto(apkg_file)

# Delete temporary files that were created when the collection was created
os.remove(os.path.join(temp_dir, 'collection.anki2'))
os.remove(os.path.join(temp_dir, 'collection.anki2-wal'))
os.rmdir(os.path.join(temp_dir, 'collection.media'))




# TODO: delete this
# https://apps.ankiweb.net/docs/addons20.html

# file = u"/path/to/text.txt"
# # select deck
# did = mw.col.decks.id("ImportDeck")
# mw.col.decks.select(did)
# # anki defaults to the last note type used in the selected deck
# m = mw.col.models.byName("Basic")
# deck = mw.col.decks.get(did)
# deck['mid'] = m['id']
# mw.col.decks.save(deck)
# # and puts cards in the last deck used by the note type
# m['did'] = did
# # import into the collection
# importer = TextImporter(mw.col, file)
# importer.initMapping()
# importer.run()