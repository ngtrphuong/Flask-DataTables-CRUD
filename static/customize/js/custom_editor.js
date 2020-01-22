// This is the JS AJAX function to handle Create, Read, Update, Delete Database display in "index.html" template
// Created and updated by Phuong Nguyen on Jan 14, 2020
// Reference Sources:
//	1. https://codepen.io/ngtrphuong/pen/BayVGjV
//	2. https://jsfiddle.net/jamiguel77/wa34c57m/
//	3. https://datatables.net/forums/discussion/34781/how-to-modify-datatables-editor-submit-format
//	4. https://editor.datatables.net/examples/inline-editing/responsive.html
//	5. https://stackoverflow.com/questions/10434599/get-the-data-received-in-a-flask-request
//	6. https://jsfiddle.net/ngtrphuong/ma6r1s8p/
//	7. https://jsfiddle.net/ngtrphuong/apbv0j9c/
var editor; // use a global for the submit and return data rendering in the examples
// Refer from https://editor.datatables.net/examples/inline-editing/responsive.html
$(document).ready(function() {
	editor = new $.fn.dataTable.Editor( {
		ajax: {
			create: {
				type: 'POST',
				url: "/_handle_crud",
				headers: {
					"Content-Type": "application/json; charset=utf-8",
				},
				contentType: "application/json",
				dataType: "json",
				data: function ( d ) {
					console.log(d);
					return JSON.stringify(d);
				}
			},
			edit: {
			   "type" : "POST",
				url: "/_handle_crud",
				headers: {
					"Content-Type": "application/json; charset=utf-8",
				},
				contentType: "application/json",
				dataType: "json",
				data: function ( d ) {
					console.log(d);
					//var tmp = d['data'];
					//console.log(tmp);
					//d = tmp;
					return JSON.stringify(d);
				}
			},
			remove: {
				//type: 'DELETE',
				type: 'POST', //Help easier in handling request from Flask codes
				url: "/_handle_crud",
				headers: {
					"Content-Type": "application/json; charset=utf-8",
				},
				contentType: "application/json",
				dataType: "json",
				data: function ( d ) {
					console.log(d);
					return JSON.stringify(d);
				}
			}
		},
		table: '#output',
		idSrc:  'id',
		fields: [
			{label: "id", name: "id"},
			{label: "some_texts", name: "some_texts"},
			{label: "other_text", name: "other_text"},
			{label: "other_text1", name: "other_text1"},
			{label: "other_text2", name: "other_text2"},
			{label: "other_text3", name: "other_text3"},
			{label: "other_text", name: "last_texts"}
		]
	} );
 
	// Activate an inline edit on click of a table cell
	$('#output').on( 'click', 'tbody td:not(:first-child)', function (e) {
		editor.inline( this );
	} );
	
    // Inline editing in responsive cell
    $('#example').on( 'click', 'tbody ul.dtr-details li', function (e) {
        // Ignore the Responsive control and checkbox columns
        if ( $(this).hasClass( 'control' ) || $(this).hasClass('select-checkbox') ) {
            return;
        }
 
        // Edit the value, but this method allows clicking on label as well
        editor.inline( $('span.dtr-data', this) );
    } );
	
    var table = $('#output').DataTable( {
		//ajax: "/_handle_crud",
		dom: 'Bfrtip',
        columns: [
			{data: "id"},
			{data: "some_texts"},
			{data: "other_text"},
			{data: "other_text1"},
			{data: "other_text2"},
			{data: "other_text3"},
			{data: "last_texts"}
		],		
        select: true,
		colReorder: true,
        responsive: {
            details: {
				renderer: function ( api, rowIdx, columns ) {
					var data = $.map( columns, function ( col, i ) {
						return col.hidden ?
							'<tr data-dt-row="'+col.rowIndex+'" data-dt-column="'+col.columnIndex+'">'+
								'<td>'+col.title+':'+'</td> '+
								'<td>'+col.data+'</td>'+
							'</tr>' :
							'';
					} ).join('');

					return data ?
						$('<table/>').append( data ) : false;
				}
            }
        },
		buttons: [
            { extend: "create", editor: editor },
            { extend: "edit",   editor: editor },
            { extend: "remove", editor: editor },
            {
                extend: 'collection',
                text: 'Export',
                buttons: [
                    'copy',
                    'excel',
                    'csv',
                    'pdf',
                    'print'
                ]
            }
        ]
    } );
	// BUTTONS

	new $.fn.dataTable.Buttons(table, [
		{extend: "create", editor: editor},
		{extend: "edit", editor: editor},
		{extend: "remove", editor: editor},
		{extend: "excel"},
		{extend: "csv"},
		{extend: "pdf"}
	]);

	table.buttons().container()
			.appendTo($(table.table().container(), '.col-sm-6:eq(0)'));
} );
