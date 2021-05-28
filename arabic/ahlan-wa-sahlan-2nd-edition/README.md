Ahlan wa Sahlan: Functional Modern Standard Arabic for Beginners, second edition

- Short vowels (حَرَكَات) included
- Plurals added as separate entries so they can be studied explicitly
- Chapter and part of speech added as tags as well as an arbitrary category (e.g. Places, Numbers, People)

Generated from [https://github.com/bmaupin/android-arabic-flashcards/blob/master/android_arabic_flashcards/assets/databases/cards.db](https://github.com/bmaupin/android-arabic-flashcards/blob/master/android_arabic_flashcards/assets/databases/cards.db) using this query:

```sql
select arabic,
       english,
       -- Concat type
       (type ||
         -- ...and category if it isn't empty (https://stackoverflow.com/a/37330557/399105)
         coalesce(" " || nullif(category, ""), "") ||
         -- ...and chapter_tag column from each row where _id matches (see group by below) (https://stackoverflow.com/a/3926380/399105)
         " " || group_concat(chapter_tag, " ")) as tags
  -- Join cards and chapters and prepend chapter with "Chapter_"
  from (select cards.*, ("Chapter_" || chapter) as chapter_tag 
    from cards
    join aws_chapters on cards._id = aws_chapters.card_ID)
  group by(_id)
  order by _id;
```
