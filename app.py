from flask import Flask, render_template, request, jsonify
import requests
import sqlite3
import pandas as pd
import  json
 
# Database file
DB = "sample_data.sqlite"
 
# Create app
app = Flask(__name__)
app.config.from_object(__name__)
 
# Basic initial home page
@app.route("/")
@app.route("/index/")
def index():
    # Load table from database
    conn = sqlite3.connect(DB)
    conn.row_factory = sqlite3.Row
    df = pd.read_sql("SELECT * FROM sample_data_table ", conn)
    conn.close()
    # Only display the empty column and the id column
    html_table = df.to_html(escape=False, index=False, justify="left", columns=["id", "some_texts", "other_text", "other_text1", "other_text2", "other_text3", "last_texts"])
    # Manually change table id and class.
    # (built-in pandas way doesn't seem to work)
    split_html = html_table.split("\n")
    split_html[0] = """<table id="output" class="display">"""

    html_table = "\n".join(split_html)
    #print (html_table)
    # Pass html_table and selected_rows to template
    return render_template("index.html", table=html_table)
     
# Handle CRUD (Create, Read, Update and Delete) events
@app.route("/_handle_crud", methods=['GET', 'POST', 'PUT', 'DELETE'])
def crud_db_from_app():

    tableName	=	'sample_data_table'
    # https://stackoverflow.com/questions/10434599/get-the-data-received-in-a-flask-request
    jsonRaw = request.get_json()
    print(jsonRaw)
    actions 	= 	jsonRaw['action']
    dataStr 	= 	jsonRaw['data']
    # https://stackoverflow.com/questions/18552001/accessing-dict-keys-element-by-index-in-python3/27638751#27638751
    row_id		=	0
    col_Info    =   ""
    col_Value   =   ""
    colListStr  =   ""
    colValStr   =   ""
    if ((actions == "edit") or (actions == "remove")):
        row_id  =   list(dataStr)[0]
        valueStr	=	dataStr[row_id]
        col_Info	=	list(valueStr)[0]
        col_Value	=	valueStr[col_Info]
    elif (actions == "create"):
        createData  =   dataStr['0']
        row_id      =   createData['id']
        col_List    =   list(createData)
        colListStr  =   ','.join(col_List) # https://www.geeksforgeeks.org/python-program-to-convert-a-list-to-string/
        # https://stackoverflow.com/questions/1614236/in-python-how-do-i-convert-all-of-the-items-in-a-list-to-floats
        col_Value   =   list(createData.values())
        colValStr   =   '","'.join(col_Value)
        colValStr   =   '"' + colValStr + '"'
    else:
        print("Unknown action to follow up" + actions)
        
    sql_query = ""
    if (actions == "edit"):
        print("Server is handling the POST:edit action")
        sql_query = "UPDATE " + tableName + " SET " + col_Info + " = '" + col_Value + "' WHERE id = " + row_id		
    elif (actions == "remove"):
        print("Server is handling the POST:delete action")
        sql_query = "DELETE FROM " + tableName + " WHERE id = " + row_id
    elif (actions == "create"):
        print("Server is handling the POST:create action")
        sql_query = "INSERT INTO " + tableName + "(" + colListStr + ") VALUES (" + colValStr + ");" 
    else:
        print("Server is handling the POST:" + str(actions) + " action")

    print("Final SQL query string: " + sql_query)
    # Now update database with the selection/deselection information
    conn = sqlite3.connect(DB)
    conn.row_factory = sqlite3.Row
    c = conn.cursor()
    if (sql_query != ""):
	    c.execute(sql_query)
	    conn.commit()
    # It's time to read again fromm exact row we update/modify if any
    # https://medium.com/@PyGuyCharles/python-sql-to-json-and-beyond-3e3a36d32853
    jsonDataRespond = {}
    if ((actions == "edit") or (actions == "create")):
        row_query = "SELECT * FROM " + tableName + " WHERE id = " + row_id
        row_query_result = c.execute(row_query)
        jsonData = []
        for row in row_query_result:
            jsonData.append({'id':row[0],'some_texts':row[1],'other_text':row[2],'other_text1':row[3],'other_text2':row[4],'other_text3':row[5],'last_texts':row[6]})
        conn.close()
        jsonDataRespond = json.dumps({'data':jsonData})
    elif (actions == "remove"):
        jsonDataRespond = "{'data':[]}"
    else:
        print("Unknown action to follow up")
        jsonDataRespond = {'data': "Unknown action to follow up"}		
    print("JSON Respond Data: ----")
    print(jsonDataRespond)	
	
    return jsonDataRespond
 
if( __name__ == '__main__'):
    app.run(host='0.0.0.0', port=8000, debug=True)
