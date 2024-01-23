# ENV-REFINER <!-- omit in toc -->

A simple project to manage the environment of the application, share it in the repository without exposing secret and validate an environment.

- [Installation](#installation)
- [Usage](#usage)
  - [Define your dotenv](#define-your-dotenv)
  - [Load the environment](#load-the-environment)
  - [Render the environment to a file](#render-the-environment-to-a-file)
- [Definition of placeholder](#definition-of-placeholder)
  - [env](#env)
  - [docker](#docker)
  - [uuid](#uuid)
  - [date](#date)
- [Placeholders in WIP status](#placeholders-in-wip-status)
  - [random](#random)
  - [file](#file)
  - [base64](#base64)
  - [base64file](#base64file)


## Installation

```bash
npm install $TBD
```

## Usage

This librairie enable you define your dotenv with placeholde. That mean, you can define where it would load the informations and replace the placeholder.
That way you can have your dotenv in the repository. Load the information from your environment or directly from your docker compose.

### Define your dotenv

```bash
# .env
# Load from the environment
APP_NAME={{env:APP_NAME}}

# DATABASE_URL={{docker:db.DB_URL}}

# Load from the docker compose (from the service "db" environment)
POSTGRES_USER={{docker:db.POSTGRES_USER}}
POSTGRES_PASSWORD={{docker:db.POSTGRES_PASSWORD}}
POSTGRES_DB={{docker:db.POSTGRES_DB}}

# Generate a uuid for this variable at each restart
COOKIE_SECRET={{uuid}}
```

### Load the environment

```ts
import configure from 'env-refiner'

const env = configure({})

// Will print the value of the environment variable APP_NAME loaded from the environment
console.log(env.get('APP_NAME'))


// Will print the value of the environment variable DATABASE_URL loaded from the docker compose
console.log(env.get('DATABASE_URL'))
```

You can define a schema to validate the environments variables and especially to remove the unused environment variables:

```ts
import zod from 'zod';
import configure from 'env-refiner';

const schema = zod.object({
  APP_NAME: zod.string(),
  DATABASE_URL: zod.string(),
});

const env = configure({ schema });

// Will print the value of the environment variable APP_NAME loaded from the environment
console.log(env.get('APP_NAME'));

// Will print the value of the environment variable DATABASE_URL loaded from the docker compose
console.log(env.get('DATABASE_URL'));

console.log(env.get('POSTGRES_USER')); // Will return undefined
```

This beahviour is useful to just have what you need in your environment and ensure to not access to variable that should not be used.

Note: A variable loaded from the docker compose will be send to the schema validator too. So you can validate the value of the variable loaded from the docker compose too.

You may want to have default value ? You can do it with the schema:

```ts
import zod from 'zod';
import configure from 'env-refiner';

const schema = zod.object({
  APP_NAME: zod.string().default('My App'),
  DATABASE_URL: zod.string(),
});

const env = configure({ schema });


console.log(env.get('APP_NAME')); // Will print "My App" if not set in environment
```


### Render the environment to a file

if you want you can use a template env and render it to a file with the value of the environment.
This could be useful if you want to generate a dotenv file for your docker compose for example or something else. You do what you want, I don't judge.

```ts
import zod from 'zod';
import configure from 'env-refiner';

const schema = zod.object({
  APP_NAME: zod.string().default('My App'),
  DATABASE_URL: zod.string(),
});

const env = configure({ schema, envFile: 'template.env' });

// This will write a new rendered .env file based on the template.env file
env.renderToFile('.env');
```

## Definition of placeholder

To define a placeholder you must use a basic format: `{{source:variable}}`.
Depending of the source, the variable part can be a bit different.

Here is a list of the available source:

### env
`{{env:variable_name}}`

This make you able to load a variable from the environment. It will be replaced with the found variable in the `process.env[variable_name]`.

Example:
```dotenv
APP_NAME={{env:APP_NAME}}
```

### docker
`{{docker:service.variable_name}}`

This one is a bit different, it will load the variable from the docker file by using the service name and the variable name.

The service and the variable name being separated by a dot.

Example:
```dotenv
POSTGRES_USER={{docker:db.POSTGRES_USER}}
```

### uuid
`{{uuid}}`

This one will generate a uuid at each restart of the application. It can be useful to generate a secret for example.

Example:
```dotenv
COOKIE_SECRET={{uuid}}
```

### date
`{{date}}`

This will replace the value by the current date in ISO format. This can be useful to have a timestamp for example.

Example:
```dotenv
LAST_START={{date}}
```

--------------------

## Placeholders in WIP status

### random
`{{random}}`

This will replace the value by a random string. This can be useful to have a secret for example.

### file
`{{file:path/to/file}}`

This will replace the value by the content of the file. This can be useful to load a certificate for example.

### base64
`{{base64:variable}}`

This will replace the value by the base64 encoded value of the variable. This can be useful to load a certificate for example.

### base64file
`{{base64file:path/to/file}}`

This will replace the value by the base64 encoded value of the file. This can be useful to load a certificate for example.
