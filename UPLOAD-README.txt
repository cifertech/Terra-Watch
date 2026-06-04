UPLOAD THIS FOLDER TO GITHUB - Terra Watch Live Site
====================================================

Your deploy failed because GitHub was trying to build README with Jekyll,
and the .github workflow folder was never uploaded.

EASIEST FIX (no .github folder needed):
---------------------------------------
1. Open https://github.com/cifertech/Terra-Watch
2. Click "Add file" -> "Upload files"
3. Upload everything in this folder INTO a folder named "docs" on GitHub
   (create the docs folder if it does not exist)
4. Go to Settings -> Pages
5. Source: Deploy from a branch
6. Branch: main, folder: /docs
7. Save, wait 1-2 minutes
8. Open https://cifertech.github.io/Terra-Watch/ and press Ctrl+F5

This folder IS the built app - same as localhost:5173.
Everyone can use it instantly, no install needed.
