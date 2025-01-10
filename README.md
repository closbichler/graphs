# graph-maker
Web-App for creating and analyzing graphs.

## Workflow
### Develop
Run vite and watch  
`npm run dev`

### Test
Build app into ./dist/  
`npm run build-dev` 

Run local webserver on 127.0.0.1:8000  
`python3 -m http.server -b localhost -d ./dist`

### Deployment
The repo is automatically deployed to github pages via Github Actions on commits to the main branch. It is accessible on https://closbichler.github.io/graphs/

## Todo
- Fix long edge select issue
- Don't allow to enter ¬1 value for undirected graphs
- Multi-select, box-select
- Rectangles?
- Implement shortcuts for editing nodes
- Implement context menu??
- Re-introduce deselct button??

## Resources
- Frontend: https://www.untitledui.com/free-icons