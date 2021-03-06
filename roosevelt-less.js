const fs = require('fs')
const path = require('path')
const less = require('less')

module.exports = {
  versionCode: function (app) {
    return `@${app.get('params').css.versionFile.varName}: '${app.get('appVersion')}';\n`
  },

  parse: function (app, fileName) {
    return new Promise((resolve, reject) => {
      const cssCompiler = app.get('params').css.compiler
      const params = cssCompiler.params || {}

      // LESS render options
      const options = {
        paths: app.get('cssPath'),
        filename: path.basename(fileName)
      }

      const lessInput = fs.readFileSync(path.join(app.get('cssPath'), fileName), 'utf8')

      if (typeof params.sourceMap === 'object' && params.sourceMap !== null && params.sourceMap !== undefined && app.settings.env === 'development') {
        options.sourceMap = params.sourceMap
      } else if (app.settings.env === 'development') {
        // Enable source mapping by default
        options.sourceMap = {
          sourceMapFileInline: true,
          outputSourceFiles: true
        }
      } else {
        options.sourceMap = undefined
      }

      less.render(lessInput, options, (err, output) => {
        if (err) {
          reject(err)
        }
        const newFile = fileName.replace('.less', '.css')
        const newCSS = output.css

        resolve([newFile, newCSS])
      })
    })
  }
}
