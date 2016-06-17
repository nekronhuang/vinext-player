# vinext-player

A project to learn TypeScript.

## What is vinext？

`vinext` means **video/vision next**. By the way, I prefer **vision**.

Some future projects of [Videojj](http://videojj.com) will name after `vinext`.

## Compatibility
`vinext-player` is compatible with browsers supporting **Full Screen Api** and **Flash**:

* IE 11+
* Chrome
* Firefox
* ~~Mobile browsers~~

## Quick start

### develop

```bash
# install dependencies
$ npm install

# start webpack dev server
$ npm run dev

# go to http://localhost:8800
```

### pre-release

```bash
# build for production
$ npm run prod

# upload main file
$ cd dist
# there is a command line tool written in Golang
$ ./upload -user nekron -local main -remote vinext-player.js
```
