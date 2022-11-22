# Modal Actions

Simple & customizable modal with navigation, input, confirmation buttons, tab
buttons and more.

## Development

Docker container running lite-server and watching code changes

```bash
make watch
```

Results can be tested in [http://localhost:3000/example/index.html](http://localhost:3000/example/index.html)

## Generate bundle

Local bundle pack with project name and actual project version in root folder

```bash
make bundle
```

## More

To see all make commands

```bash
make help
```

## Installation

```bash
yarn add modal-actions
```

Or directly in the HTML file

```html
<!-- Add to head HTML tag -->
<link rel="stylesheet" href="./dist/modal-actions.min.css" />
<!-- Add to the bottom of body HTML tag -->
<script src="./dist/modal-actions.min.js"></script>

<!-- or directly from unpkg -->
<link
  rel="stylesheet"
  href="https://unpkg.com/modal-actions@latest/dist/modal-actions.min.css"
/>
<script src="https://unpkg.com/modal-actions@latest/dist/modal-actions.min.js"></script>
```

## Run

```js
import ModalActions from "modal-actions";

// Only this line when included with script HTML tag
const modal = new ModalActions("#my-container");
```

Examples in example/index.html
