import '@k2oss/k2-broker-core';

metadata = {
    systemName: "com.k2.example",
    displayName: "Example Broker",
    description: "An example broker that accesses JSONPlaceholder."
};

ondescribe = async function(): Promise<void> {
    postSchema({
        objects: {
            "com_k2_todo": {
                displayName: "TODO",
                description: "Manages a TODO list",
                properties: {
                    "com_k2_todo_id": {
                        displayName: "ID",
                        type: "number"
                    },
                    "com_k2_todo_userId": {
                        displayName: "User ID",
                        type: "number"
                    },
                    "com_k2_todo_title": {
                        displayName: "Title",
                        type: "string"
                    },
                    "com_k2_todo_completed": {
                        displayName: "Completed",
                        type: "boolean"
                    }
                },
                methods: {
                    "com_k2_todo_get": {
                        displayName: "Get TODO",
                        type: "read",
                        inputs: [ "com_k2_todo_id" ],
                        outputs: [ "com_k2_todo_id", "com_k2_todo_userId", "com_k2_todo_title", "com_k2_todo_completed" ]
                    },
                    "com_k2_todo_get_params": {
                        displayName: "Get TODO",
                        type: "read",
                        parameters: {
                            "com_k2_todo_pid" : { displayName: "param1", description: "Description Of Param 1", type: "number"} 
                        },
                        requiredParameters: [ "com_k2_todo_pid" ],
                        outputs: [ "com_k2_todo_id" ]
                    }
                }
            }
        }
    });
}

onexecute = async function(objectName, methodName, parameters, properties): Promise<void> {
    switch (objectName)
    {
        case "com_k2_todo": await onexecuteTodo(methodName, properties, parameters); break;
        default: throw new Error("The object " + objectName + " is not supported.");
    }
}

async function onexecuteTodo(methodName: string, properties: SingleRecord, parameters: SingleRecord): Promise<void> {
    switch (methodName)
    {
        case "com_k2_todo_get": await onexecuteTodoGet(properties); break;
        case "com_k2_todo_get_params": await onexecuteTodoGetWithParams(parameters); break;
        default: throw new Error("The method " + methodName + " is not supported.");
    }
}

function onexecuteTodoGet(properties: SingleRecord): Promise<void> {
    return new Promise<void>((resolve, reject) =>
    {
        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function() {
            try {
                if (xhr.readyState !== 4) return;
                if (xhr.status !== 200) throw new Error("Failed with status " + xhr.status);

                var obj = JSON.parse(xhr.responseText);
                postResult({
                    "com_k2_todo_id": obj.id,
                    "com_k2_todo_userId": obj.userId,
                    "com_k2_todo_title": obj.title,
                    "com_k2_todo_completed": obj.completed
                });
                resolve();
            } catch (e) {
                reject(e);
            }
        };

        xhr.open("GET", 'https://jsonplaceholder.typicode.com/todos/' + properties["com_k2_todo_id"]);
        xhr.setRequestHeader('test', 'test value');
        xhr.send();
    });
}

function onexecuteTodoGetWithParams(parameters: SingleRecord): Promise<void> {
    return new Promise<void>((resolve, reject) =>
    {
        try {
            postResult({
                "com_k2_todo_id": parameters["com_k2_todo_pid"]
            });
            resolve();
        } catch (e) {
            reject(e);
        }
        
    });
}