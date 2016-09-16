'use strict';

//write your code here

const fs = require("fs")


class System{
  static clearScreen(){
    let lines = process.stdout.getWindowSize()[1];
    for(var i = 0; i < lines; i++) { console.log('\n'); }
    return true;
  }
  static newLine(count){
    for(let idx = 0; idx < count; idx++) console.log("\n");
    return true;
  }
  static printReadFile(file, count){
    let dot = "";
    for(let idx = 0; idx < count % 3; idx++) dot += ".";
    console.log(`Reading from "${file}" ${dot}`)
  }
  static printHeadLine(){
    let dots = "";
    for(let idx = 0; idx < 20; idx++) dots += "=";
    console.log(dots);
    return true;
  }
  static printCommand(){
    let string = "";
    for(let idx = 2; idx < process.argv.length; idx++) string += " " + process.argv[idx];
    console.log(`$ node todo.js${string}`);
  }
  static processDate(date = null){
    let d = new Date();
    let month = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    date = `${month[d.getMonth()]} ${d.getFullYear()}, ${d.getDate()}`;
    return date;
  }
}

let db_file_name = "tododb";
let models = require("./models/index");
class Todo{
  static printList(where_stmt = null){
    if(!where_stmt) where_stmt = { isActive: true }
    models.todos.findAll({
      where:where_stmt
    }).then(function(result){
      System.newLine(1);

      if(result.length){
        System.printHeadLine();
        console.log("List of Task:")
        System.printHeadLine();
        result.forEach((val, idx, array) => {
          console.log(`[${(val.isCheck) ? "x" : " "}] ${val.name}, created at ${val.createdAt}`);
          console.log(`••• ${(val.updatedAt) ? `Completed at, ${val.updatedAt}` : "Not Completed"}`);
          console.log(`••• Tag: ${(val.tag) ? `${val.tag}` : "-"}`);
          System.newLine(1);
        });
      } else {
        System.printHeadLine();
        console.log(`Opps.. Not Found`);
        System.printHeadLine();
        console.log(`System cannot find any task from to-do list`);
        System.newLine(1);
      }
      return true;
    });
  }
  static addTask(name, tag = null){
    console.log(`-- Add task "${name}"`);
    models.todos.create({
      name:name,
      tag:tag
    }).then(function(){
      Todo.printList();
      return true;
    });
  }
  static deleteTask(value){
    console.log(`-- Delete task "${value}"`);

    models.todos.update({
      isActive: false
    }, {
      where: {
        name: {
          $like: value
        }
      }
    }).then(function(){
      Todo.printList();
      return true;
    });
  }
  static checkTask(value, status){
    console.log(`-- Check task "${value}" to ${status}`);
    if(status == "true" || status == "false"){
      if(status == "true") status = true;
      else if(status == "false") status = false;
      models.todos.update({
        isCheck: status
      }, {
        where: {
          name: {
            $like: value
          }
        }
      }).then(function(){
        Todo.printList();
        return true;
      });
    } else {
      System.printHeadLine();
      console.log(`Opps.. Error!`);
      System.printHeadLine();
      console.log(`System only can accept true or false`);
      System.newLine(1);
      return false;
    }
  }
  static filter(command){
    let where_stmt_cstm = null;
    switch (command.toLowerCase()) {
      case "list:outstanding":
        console.log(`-- Filter: Outstanding`);
        where_stmt_cstm = { isActive:true, isCheck:false };
        Todo.printList(where_stmt_cstm);
      break;
      case "list:completed":
        console.log(`-- Filter: Completed`);
        where_stmt_cstm = { isActive:true, isCheck:true };
        Todo.printList(where_stmt_cstm);
      break;
      case "filter:array":
        let argument_input = process.argv[2].toLowerCase();
        let command = argument_input.split(":"); command = command[1];
        if(command[0] == "[") command = command.substring(1);
        if(command[command.length-1] == "]") command = command.substring(0, command.length-1);
        command = command.split(",");

        let temp_string = "-- Filter: ";
        for(let idx = 0; idx < command.length; idx++){
          temp_string += command[idx];
          if(idx != command.length - 1){
            temp_string += ", ";
          }
        }
        console.log(temp_string);

        let tag_where = {
          $like: { $any: command}
        };

        where_stmt_cstm = { isActive:true, tag:tag_where };
        Todo.printList(where_stmt_cstm);
      break;
      default:break;
    }
    return true;
  }
  static readFile(command){
    let read_file_flag = true;
    System.clearScreen();
    System.printReadFile(db_file_name, 0);
    let index = 0;
    let read_process = function(){
        if(read_file_flag){
          switch(command.toLowerCase()){
            case "list":
              Todo.printList();
            break;
            case "add":
              if(process.argv.length == 4)
                Todo.addTask(process.argv[3]);
              else if(process.argv.length == 5)
                Todo.addTask(process.argv[3], process.argv[4]);
            break;
            case "delete":
              Todo.deleteTask(process.argv[3]);
            break;
            case "check":
              Todo.checkTask(process.argv[3], process.argv[4]);
            break;
            case "list:outstanding":
              Todo.filter("list:outstanding");
            break;
            case "list:completed":
              Todo.filter("list:completed");
            break;
            case "filter:array":
              Todo.filter("filter:array");
            break;
            default: break;
          }
          return true;
        }
        System.clearScreen();
        System.printCommand();
        System.newLine(1);
        System.printReadFile(db_file_name, index);
        index += 1;
        setTimeout(function(){
          read_process();
        }, 1000);
    }
    read_process();
  }
  static writeFile(){
    let new_json = [];
    for(let idx = 0; idx < list_arr.list.length; idx++){
      new_json[idx] = {};
      new_json[idx].task = list_arr.list[idx].name;
      new_json[idx].isCheck = list_arr.list[idx].isCheck;
      new_json[idx].tag = list_arr.list[idx].tag;
      new_json[idx].dateCreated = list_arr.list[idx].dateCreated;
      new_json[idx].dateCompleted = list_arr.list[idx].dateCompleted;
    }
    fs.writeFile('data.json', JSON.stringify(new_json), (err) => {
      if (err) throw err;
    });
  }
  static start(){
    function printCommand(){
      System.newLine(1);
      console.log(`Please make an input. List:`);
      console.log(`[1] LIST`);
      console.log(`    get all task from '${db_file_name}'`);
      console.log(`[2] ADD [your_task] [your_tag]`);
      console.log(`    add task to '${db_file_name}'`);
      console.log(`    please separate with comma (,) if you want to add tag`);
      console.log(`[3] DELETE [choosen_task]`);
      console.log(`    delete task from '${db_file_name}'`);
      console.log(`[4] CHECK [choosen_task] [true || false]`);
      console.log(`    delete task from '${db_file_name}'`);
      console.log(`[5] LIST:[outstanding]`);
      console.log(`    get non-completed task list from '${db_file_name}'`);
      console.log(`[6] LIST:[completed]`);
      console.log(`    get completed task list from '${db_file_name}'`);
      console.log(`[7] FILTER:[search_tag1, search_tag2, ...]`);
      console.log(`    get task list for the search tag from '${db_file_name}'`);
      System.newLine(1);
    }

    if(process.argv.length < 3){
      printCommand();
      return true;
    }

    let argument_input = process.argv[2].toLowerCase();
    if(argument_input == "list"){
      this.readFile("list");
    } else if(argument_input == "add"){
      if(process.argv.length < 4) printCommand();
      else this.readFile("add");
    } else if(argument_input == "delete"){
      if(process.argv.length < 4) printCommand();
      else this.readFile("delete");
    } else if(argument_input == "check"){
      if(process.argv.length < 5) printCommand();
      else this.readFile("check");
    } else if(argument_input.substring(0, 5)  == "list:"){
      let command = argument_input.split(":");
      command = command[1];
      switch (command) {
        case "outstanding":
          this.readFile("list:outstanding");
        break;
        case "completed":
          this.readFile("list:completed");
        break;
        default: printCommand(); break;
      }
    } else if(argument_input.substring(0, 7)  == "filter:"){
      let command = argument_input.split(":");
      command = command[1];
      if(command[0] == "[")
        command = command.substring(1);
      if(command[command.length-1] == "]")
        command = command.substring(0, command.length-1);
      command = command.split(",");

      if(command.length > 0) this.readFile("filter:array");
      else printCommand();
    } else {
      printCommand();
    }
  }
}
Todo.start();
