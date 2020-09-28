# compiling
## requirements
- [nodejs](https://nodejs.org/) installed
- yarn installed (if npm present use `npm install -g yarn`)

## Building executable
 - Run `yarn build`
 - Executable is located inside dist folder


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
 - [ ] fix building scripts
 - [ ] fix vscode debug
 - [ ] add electron building
