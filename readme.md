[![GitHub release (latest SemVer)](https://img.shields.io/github/v/release/sciator/GeneticRacers?&style=for-the-badge)](https://github.com/sciator/GeneticRacers/releases)
[![GitHub Workflow Status build](https://img.shields.io/github/workflow/status/sciator/GeneticRacers/Release?&style=for-the-badge)](https://github.com/sciator/GeneticRacers/releases)
[![GitHub Workflow Status test](https://img.shields.io/github/workflow/status/sciator/GeneticRacers/Tests?label=tests&style=for-the-badge)](https://github.com/sciator/GeneticRacers/actions?query=workflow%3ATests)
[![GitHub last commit](https://img.shields.io/github/last-commit/sciator/GeneticRacers?&style=for-the-badge)](https://github.com/sciator/GeneticRacers/commits/master)
[![GitHub commit activity](https://img.shields.io/github/commit-activity/m/sciator/GeneticRacers?&style=for-the-badge)](https://github.com/sciator/GeneticRacers/graphs/commit-activity)
[![Lines of code](https://img.shields.io/tokei/lines/github/sciator/GeneticRacers?&style=for-the-badge)](https://github.com/sciator/GeneticRacers/pulse)
[![GitHub issues](https://img.shields.io/github/issues/sciator/GeneticRacers?&style=for-the-badge)](https://github.com/sciator/GeneticRacers/issues)
[![GitHub](https://img.shields.io/github/license/sciator/GeneticRacers?&style=for-the-badge)](https://github.com/sciator/GeneticRacers/blob/master/license.md)
[![GitHub top language](https://img.shields.io/github/languages/top/sciator/GeneticRacers?&style=for-the-badge)](https://github.com/sciator/GeneticRacers)

[![Node js](https://img.shields.io/badge/node.js%20-%2343853D.svg?&style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Typescript](https://img.shields.io/badge/typescript%20-%23007ACC.svg?&style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

[![express](https://img.shields.io/badge/express.js%20-%23404d59.svg?&style=for-the-badge)](https://expressjs.com/)
[![react](https://img.shields.io/badge/react%20-%2320232a.svg?&style=for-the-badge&logo=react&logoColor=%2361DAFB)](https://reactjs.org/)
[![HTML5](https://img.shields.io/badge/html5%20-%23E34F26.svg?&style=for-the-badge&logo=html5&logoColor=white)](https://www.w3schools.com/html/)

[![git](https://img.shields.io/badge/git%20-%23F05033.svg?&style=for-the-badge&logo=git&logoColor=white)](https://git-scm.com/)
[![github](https://img.shields.io/badge/github%20-%23121011.svg?&style=for-the-badge&logo=github&logoColor=white)](https://github.com/)
[![github actions](https://img.shields.io/badge/GH%20Actions-%23161616.svg?&style=for-the-badge&logo=github&logoColor=white)](https://github.com/actions)
[![webpack](https://img.shields.io/badge/webpack%20-%238DD6F9.svg?&style=for-the-badge&logo=webpack&logoColor=black)](https://webpack.js.org/)
[![pkg](https://img.shields.io/badge/-%20%20%F0%9F%93%A6PKG-%23777777?&style=for-the-badge&logoColor=white)](https://github.com/vercel/pkg)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg?&style=for-the-badge&logoColor=white)](https://github.com/semantic-release/semantic-release)



# compiling
## requirements
   - [node](https://nodejs.org/) installed
   - [yarn](https://yarnpkg.com/) installed

## Building executable
 - Run `yarn dist`
 - Executable is located inside dist folder

### dev
 - ```yarn ci``` or ```yarn install``` (if not called already)
 - ```yarn dev```

# Running
open Start.exe


## Usage

Learning steering car inside 2D using genetic algorithm

Every cas has:
 - neural net. 
 - 3 inputs: Left, Right, Forward.
 - 5 sensors measuring distance from nearest obstacle

Every neural net has it's score based on checkpoints reached.
Car that manages reach goal has score 100.



controls:
 - Maximum generation: max generation if no winner found
 - Population size: car count
 - Mutation rate: chance of change inside neural net
 - Weighted/Percent: type of selecting adepts to pass genes to next generation 
   - weighted: 
   - Percent: 
 - Hidden layers: every number represents number of neurons inside layer

Pressing Start will start algorithmic calculations (can take some time). Plot wiht maximal fitnesses is shown when algorithm is done running.

Clicking item in list will start replay


# TODO
 - [X] fix building scripts
 - [ ] fix vscode debug
 - [ ] add electron building
 - [ ] delete this list (replace with issues)
