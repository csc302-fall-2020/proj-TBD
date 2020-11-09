# SDC Development Utilities

## Installation

- Run `npm install`

## Scripts

### Sample Data

Use `npm run load-sample-data` to load sample data into the database.

Loads data into collections:

- `form_repsonses`
- `forms`

**Adding Data**

Each file in `/data` named `<collection_name>.json` represents a MongoDB collection. Create a new file in this directory to add new data.

e.g. `scripts/data/clinicians.json`

```json
[
  {
		"ClinicianID": "1",
    "ClinicianName": "John Smith"
  },
 	{
    "FormFillerID": "14213123",
    "ClinicianName": "Jane Doe"
  }

```

**Note**

The script clears each collection when it runs, so any personal data you may have will be deleted.