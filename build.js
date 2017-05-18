const path  = require('path')
const fs    = require('fs')

const buildPath   = path.resolve(__dirname, 'build')
const distPath    = path.resolve(__dirname, 'dist')
const svgPath     = path.resolve(__dirname, 'mdi/icons/svg')

const tplFile     = path.resolve(__dirname, 'build.tpl')
const pkgFile     = path.resolve(__dirname, 'package.json')

function toPascalCase(str) {
  return str.toLowerCase()
    .split(/-/g).map(token => 
      token.charAt(0).toUpperCase() + token.slice(1))
    .join('')
}

const copyPackage = () => fs.readFile(pkgFile, (err, pkgRaw) => {
  const pkgObj = JSON.parse(pkgRaw)

  // Nobody cares for errors... nobody
  fs.writeFile(path.resolve(distPath, 'package.json'), JSON.stringify(Object.keys(pkgObj)
    .map((key) => {
      if (!/script|devDependencies|dependencies/.test(key)) {
        return pkgObj[key]
      }
    })
  ))
})

const buildIcons = (components) => fs.readFile(path.resolve('./build.tpl'), (err, tpl) => {
  for (const component of components) {
    fs.writeFileSync(
      path.join(buildPath,`${component.name}Icon.js`),
      tpl.toString('utf-8')
        .replace(/\{\{icon\}\}/g, component.name.toLowerCase())
        .replace(/\{\{path\}\}/g, component.path)
    )
  }

  copyPackage()
})

fs.readdir(svgPath, (a, svgs) => {
  buildIcons(svgs.map(svg => {
    return { 
      name: toPascalCase(svg).slice(0, -4),
      path: (() => {
          const matches = /\sd="(.*)"/.exec(fs.readFileSync(path.join(svgPath, svg), {
            encoding: 'utf8'
          }))

          if (matches) {
            return matches[0]
          }
      })()
    }
  }).filter(_ => _.path))
})


