const fs = require("fs");
const path = require("path");

const snippetDir = path.join("pkg", "solver-mt", "snippets");
if (fs.existsSync(snippetDir)) {
  function walkDir(dir) {
    fs.readdirSync(dir).forEach((file) => {
      const fullPath = path.join(dir, file);
      if (fs.statSync(fullPath).isDirectory()) {
        walkDir(fullPath);
      } else if (file.endsWith(".js")) {
        let content = fs.readFileSync(fullPath, "utf8");
        // Apuntamos con 4 puntos / 3 niveles hacia arriba para salir de la carpeta de snippets
        content = content.replace(
          /from\s+['"][^'"]+['"]/g,
          "from '../../../solver.js'"
        );
        fs.writeFileSync(fullPath, content);
        console.log("Parcheado con 3 niveles exactos:", fullPath);
      }
    });
  }
  walkDir(snippetDir);
}
