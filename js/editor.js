function setEditorSize(){
    // Sets the size of the text editor window.
    fillWindow($('#editor'));
}

function getFileExtension(file){
    var parts=file.split('.');
    return parts[parts.length-1];
}

function setSyntaxMode(ext){
    // Loads the syntax mode files and tells the editor
    var filetype = new Array();
    // add file extensions like this: filetype["extension"] = "filetype":
    filetype["h"] = "c_cpp";
    filetype["c"] = "c_cpp";
    filetype["clj"] = "clojure";
    filetype["coffee"] = "coffee"; // coffescript can be compiled to javascript
    filetype["coldfusion"] = "cfc";
    filetype["cpp"] = "c_cpp";
    filetype["cs"] = "csharp";
    filetype["css"] = "css";
    filetype["groovy"] = "groovy";
    filetype["haxe"] = "hx";
    filetype["htm"] = "html";
    filetype["html"] = "html";
    filetype["java"] = "java";
    filetype["js"] = "javascript";
    filetype["jsm"] = "javascript";
    filetype["json"] = "json";
    filetype["latex"] = "latex";
    filetype["tex"] = "latex";
    filetype["less"] = "less";
    filetype["ly"] = "latex";
    filetype["ily"] = "latex";
    filetype["lua"] = "lua";
    filetype["markdown"] = "markdown";
    filetype["md"] = "markdown";
    filetype["mdown"] = "markdown";
    filetype["mdwn"] = "markdown";
    filetype["mkd"] = "markdown";
    filetype["ml"] = "ocaml";
    filetype["mli"] = "ocaml";
    filetype["pl"] = "perl";
    filetype["php"] = "php";
    filetype["powershell"] = "ps1";
    filetype["py"] = "python";
    filetype["rb"] = "ruby";
    filetype["scad"] = "scad"; // seems to be something like 3d model files printed with e.g. reprap
    filetype["scala"] = "scala";
    filetype["scss"] = "scss"; // "sassy css"
    filetype["sh"] = "sh";
    filetype["sql"] = "sql";
    filetype["svg"] = "svg";
    filetype["textile"] = "textile"; // related to markdown
    filetype["xml"] = "xml";

    if(filetype[ext]!=null){
        // Then it must be in the array, so load the custom syntax mode
        // Set the syntax mode
        OC.addScript('files_latexeditor','aceeditor/mode-'+filetype[ext], function(){
            var SyntaxMode = require("ace/mode/"+filetype[ext]).Mode;
            window.aceEditor.getSession().setMode(new SyntaxMode());
        });
    }
}
function isLatex(filename){
    return getFileExtension(filename)=='tex'||getFileExtension(filename)=='latex';
}

function showControls(filename,writeperms){
    // Loads the control bar at the top.
    // Load the new toolbar.
    var editorbarhtml = '<div id="editorcontrols" style="display: none;"><div class="crumb svg last" id="breadcrumb_file" style="background-image:url(&quot;'+OC.imagePath('core','breadcrumb.png')+'&quot;)"><p>'+filename+'</p></div>';
    if(writeperms=="true"){
        editorbarhtml += '<button id="editor_save">'+t('files_latexeditor','Save')+'</button><div class="separator"></div>';
        if(isLatex(filename)){
            editorbarhtml += '<button id="editor_compile">'+t('files_latexeditor','Compile')+'</button>';
	    editorbarhtml += '<select id="editor_loadtemplate" style="width: 10em">';
	    editorbarhtml +='<option>Select Template</option>';
	    editorbarhtml +='<option val="Beamer">Beamer</option>';
	    editorbarhtml +='<option val="Article">Article</option>';
	    editorbarhtml +='</select><div class="separator"></div>';
	}
    }
    editorbarhtml += '<label for="editorseachval">Search:</label><input type="text" name="editorsearchval" id="editorsearchval"><div class="separator"></div><button id="editor_close">'+t('files_latexeditor','Close')+'</button></div>';
	
    // Change breadcrumb classes
    $('#controls .last').removeClass('last');
    $('#controls').append(editorbarhtml);
    $('#editorcontrols').fadeIn('slow');
}

function bindControlEvents(){
    $("#editor_save").die('click',doFileSave).live('click',doFileSave);
    $('#editor_close').die('click',hideFileEditor).live('click',hideFileEditor);    
    
    $('#editor_compile').die('click',doCompile).live('click',doCompile);
    $('#editor_loadtemplate').die('change',doLoadTemplate).live('change',doLoadTemplate);

    $('#editorsearchval').die('keyup', doSearch).live('keyup', doSearch);
    $('#clearsearchbtn').die('click', resetSearch).live('click', resetSearch);
    $('#nextsearchbtn').die('click', nextSearchResult).live('click', nextSearchResult);
}

// returns true or false if the editor is in view or not
function editorIsShown(){
    // Not working as intended. Always returns true.
    return is_editor_shown;
}

//resets the search
function resetSearch(){
    $('#editorsearchval').val('');
    $('#nextsearchbtn').remove();
    $('#clearsearchbtn').remove();
    window.aceEditor.gotoLine(0);
}

// moves the cursor to the next search resukt
function nextSearchResult(){
    window.aceEditor.findNext();
}
//let us init terminal

function doSearch(){
    // check if search box empty?
    if($('#editorsearchval').val()==''){
        // Hide clear button
        window.aceEditor.gotoLine(0);
        $('#nextsearchbtn').remove();
        $('#clearsearchbtn').remove();
    } else {
        // New search
        // Reset cursor
        window.aceEditor.gotoLine(0);
        // Do search
        window.aceEditor.find($('#editorsearchval').val(),{
            backwards: false,
            wrap: false,
            caseSensitive: false,
            wholeWord: false,
            regExp: false
        });
        // Show next and clear buttons
        // check if already there
        if($('#nextsearchbtn').length==0){
            var nextbtnhtml = '<button id="nextsearchbtn">Next</button>';
            var clearbtnhtml = '<button id="clearsearchbtn">Clear</button>';
            $('#editorsearchval').after(nextbtnhtml).after(clearbtnhtml);
        }
    }
}
function AjaxCompile(ajaxpath, path,filename){
    var jqxhr = $.ajax({
        type: 'POST',       
        url: ajaxpath,
        data: {
            path:path,  
            filename:filename
        },
        dataType: 'json',    
        global: false,
        async:false,
        success: function(jsondata) {
            if(jsondata.status!='success'){
                // Compile failed
                //$('#latexresult').append('<b>Save</b>');
                //$('#latexresult').after('<p  style="float: left">Failed to save file</p>');
                $(":button:contains('ViewPdf')").button('disable');
                
            } else {
                // Compile OK
                // Update titles					            
                $(":button:contains('ViewPdf')").button('enable');
            }
            return jsondata;
        }
    }).responseText;
    
    jqxhr=jQuery.parseJSON(jqxhr);

    return jqxhr;

			
}
function DestroIfExist(idname)
{
    if(document.getElementById(idname)) {
        $("#"+idname).remove();    
    }
}
function compileFile(filename,path){
	
    //var message="Dir: "+path+" \nFilename: "+filename;
	
	
    var ajaxpath=OC.filePath('files_latexeditor','ajax','compile.php');
    var pdffile="";
    var data="";
    
    DestroIfExist("dialogcompile");
    var compileDlg=$('<div id="dialogcompile"  title="'+'Compiling:'+ path+filename +'"><div id="latexresult" class="ui-widget-content" style=""> </div></div>').dialog({
        modal: false,
        open: function() {  },
        buttons: {
            Close: function() {
                $( this ).dialog( "close" );
            },
            Compile: function(){
                // $("#result").load(ajaxpath);
                json=AjaxCompile(ajaxpath,path, filename);
                
                if(json){
                    //alert(json.data.output);
                    $('#latexresult').html("");
                    if(json.data.message){
                        $('#latexresult').html(json.data.message);
                        $('#latexresult').addClass('ui-state-error');
                    }
                    else
                        $('#latexresult').removeClass('ui-state-error');
                    
                    $('#latexresult').append(json.data.output);    
                   
                }
                
            },
            ViewPdf: function(){
                pdffullpath="/?app=files&getfile=download.php?file="+json.data.path+json.data.pdffile;
                 fullurl=pdffullpath;
                 console.log(pdffullpath);
                // DestroIfExist("viewpdf");
                //alert(fullurl);
                function im(path) { return OC.filePath('files_pdfviewer','js','pdfjs/web/images/'+path); };
                               
                              
		embcontrols='<button id="previous" onclick="PDFView.page--;" oncontextmenu="return false;"><img src="'+im('go-up.svg')+'" align="top" height="10"/>Previous</button><button id="next" onclick="PDFView.page++;" oncontextmenu="return false;"><img src="'+im('go-down.svg')+'" align="top" height="10"/>Next</button><div class="separator"></div><input style="width:25px;" type="number" id="pageNumber" onchange="PDFView.page = this.value;" value="1" size="4" min="1" /><span>/</span><span id="numPages">--</span><div class="separator"></div><button id="zoomOut" title="Zoom Out" onclick="PDFView.zoomOut();" oncontextmenu="return false;"><img src="'+im('zoom-out.svg')+'" align="top" height="10"/></button><button id="zoomIn" title="Zoom In" onclick="PDFView.zoomIn();" oncontextmenu="return false;"><img src="'+im('zoom-in.svg')+
			'" align="top" height="10"/></button><div class="separator"></div><select id="scaleSelect" onchange="PDFView.parseScale(this.value);" oncontextmenu="return false;"><option id="customScaleOption" value="custom"></option><option value="0.5">50%</option><option value="0.75">75%</option><option value="1">100%</option><option value="1.25" selected="selected">125%</option><option value="1.5">150%</option><option value="2">200%</option><option id="pageWidthOption" value="page-width">Page Width</option><option id="pageFitOption" value="page-fit">Page Fit</option></select><div class="separator"></div><button id="print" onclick="window.print();" oncontextmenu="return false;"><img src="'+im('document-print.svg')+'" align="top" height="10"/>Print</button><button id="download" title="Download" onclick="PDFView.download();" oncontextmenu="return false;">'+
			'<img src="'+im('download.svg')+
                        '" align="top" height="10"/>Download</button><button id="close" title="Close viewer" onclick="hidePDFviewer();$(\'#latexresult\').empty();" oncontextmenu="return false;">x</button><span id="info">--</span></div>';
	        
                pdfview=embcontrols+'<div id="loading">Loading... 0%</div><div id="viewer"></div>';
                $('#latexresult').html(pdfview);
                PDFJS.workerSrc = OC.filePath('files_pdfviewer','js','pdfjs/build/pdf.js');
                PDFView.Ptitle = filename;
                PDFView.open(pdffullpath,1.00);
                PDFView.active=true;
                
                //window.open(url, filename, '');     
                //console.log(PDFJS);
                console.log(PDFView);
            }
                
        }		
    })
    
    
    //console.log($('#editor').position());
    //console.log($('#editor').offset());
    x=$('#editor').position().left+$('#editor').width()*0.45;
    y=$('#editor').position().top+10;
    compileDlg.dialog({
        width:$('#editor').width()*0.5,
        height:$('#editor').height()*0.85,
        position: [x, y]
    });                
    
    
    $(":button:contains('ViewPdf')").button('disable');
//reopenEditor();
}

//Tries to Load Latex template in to file
function doLoadTemplate(){
    
    if(editorIsShown()){
        var templatename = $('#editor_loadtemplate').val();
        if(templatename!='Select Template'){
	    $.post(OC.filePath('files_latexeditor','ajax','loadtemplate.php'),{"name":templatename},function(){
	    
	    });
	}
        
    }
}
//Tries to compile The file
function doCompile(){
    if(editorIsShown()){
		
        var filename = $('#editor').attr('data-filename');
        var dir=$('#editor').attr('data-dir')+'/';
	
        compileFile(filename, dir);
    }
}
// Tries to save the file.
function doFileSave(){
    if(editorIsShown()){
        // Changed contents?
        if($('#editor').attr('data-edited')=='true'){
            // Get file path
            var path = $('#editor').attr('data-dir')+'/'+$('#editor').attr('data-filename');
            // Get original mtime
            var mtime = $('#editor').attr('data-mtime');
            // Show saving spinner
            $("#editor_save").die('click',doFileSave);
            $('#save_result').remove();
            $('#editor_save').text(t('files_latexeditor','Saving...'));
            // Get the data
            var filecontents = window.aceEditor.getSession().getValue();
            // Send the data
            $.post(OC.filePath('files_latexeditor','ajax','savefile.php'), {
                filecontents: filecontents, 
                path: path, 
                mtime: mtime
            },function(jsondata){
                if(jsondata.status!='success'){
                    // Save failed
                    $('#editor_save').text(t('files_latexeditor','Save'));
                    $('#editor_save').after('<p id="save_result" style="float: left">Failed to save file</p>');
                    $("#editor_save").live('click',doFileSave);
                } else {
                    // Save OK
                    // Update mtime
                    $('#editor').attr('data-mtime',jsondata.data.mtime);
                    $('#editor_save').text(t('files_latexeditor','Save'));
                    $("#editor_save").live('click',doFileSave);
                    // Update titles
                    $('#editor').attr('data-edited', 'false');
                    $('#breadcrumb_file').text($('#editor').attr('data-filename'));
                    document.title = $('#editor').attr('data-filename')+' - DAS';
                }
            },'json');
        }
    }
    giveEditorFocus();
};

// Gives the editor focus
function giveEditorFocus(){
    window.aceEditor.focus();
};

// Loads the file editor. Accepts two parameters, dir and filename.
function showFileEditor(dir,filename){
    // Delete any old editors
    $('#editor').remove();
    if(!editorIsShown()){
        // Loads the file editor and display it.
        $('#content').append('<div id="editor"></div>');
        var data = $.getJSON(
            OC.filePath('files_latexeditor','ajax','loadfile.php'),
            {
                file:filename,
                dir:dir
            },
            function(result){
                if(result.status == 'success'){
                    // Save mtime
                    $('#editor').attr('data-mtime', result.data.mtime);
                    // Initialise the editor
                    $('.actions,#file_action_panel').fadeOut('slow');
                    $('table').fadeOut('slow', function() {
                        // Show the control bar
                        showControls(filename,result.data.write);
                        // Update document title
                        document.title = filename+' - DAS';
                        $('#editor').text(result.data.filecontents);
                        $('#editor').attr('data-dir', dir);
                        $('#editor').attr('data-filename', filename);
                        $('#editor').attr('data-edited', 'false');
                        window.aceEditor = ace.edit("editor");
                        aceEditor.setShowPrintMargin(false);
                        aceEditor.getSession().setUseWrapMode(true);
                        if(result.data.write=='false'){
                            aceEditor.setReadOnly(true);
                        }
                        setEditorSize();
                        setSyntaxMode(getFileExtension(filename));
                        OC.addScript('files_latexeditor','aceeditor/theme-clouds', function(){
                            window.aceEditor.setTheme("ace/theme/clouds");
                        });
                        window.aceEditor.getSession().on('change', function(){
                            if($('#editor').attr('data-edited')!='true'){
                                $('#editor').attr('data-edited', 'true');
                                $('#breadcrumb_file').text($('#breadcrumb_file').text()+' *');
                                document.title = $('#editor').attr('data-filename')+' * - ownCloud';
                            }
                        });
                        // Add the ctrl+s event
                        window.aceEditor.commands.addCommand({
                            name: "save",
                            bindKey: {
                                win: "Ctrl-S",
                                mac: "Command-S",
                                sender: "editor"
                            },
                            exec: function(){
                                doFileSave();	
                            }
                        });
                    });
                } else {
                    // Failed to get the file.
                    OC.dialogs.alert(result.data.message, t('files_latexeditor','An error occurred!'));
                }
            // End success
            }
            // End ajax
            );
        is_editor_shown = true;
    }
}

// Fades out the editor.
function hideFileEditor(){
    if($('#editor').attr('data-edited') == 'true'){
        
        // Hide, not remove
        $('#editorcontrols').fadeOut('slow',function(){
            // Check if there is a folder in the breadcrumb
            if($('.crumb.ui-droppable').length){
                $('.crumb.ui-droppable:last').addClass('last');
            }
        });
        // Fade out editor
        $('#editor').fadeOut('slow', function(){
            // destroy compiler dialogbox                        
            // Reset document title
            document.title = "DAS";
            $('.actions,#file_access_panel').fadeIn('slow');
            $('table').fadeIn('slow');
            
        });
        $('#notification').text(t('files_latexeditor','There were unsaved changes, click here to go back'));
        $('#notification').data('reopeneditor',true);
        $('#notification').fadeIn();
        is_editor_shown = false;
    } else {
        // Remove editor
        $('#editorcontrols').fadeOut('slow',function(){
            $(this).remove();
            $(".crumb:last").addClass('last');
        });
        // Fade out editor
        $('#editor').fadeOut('slow', function(){
            $(this).remove();
            // Reset document title
            document.title = "ownCloud";
            $('.actions,#file_access_panel').fadeIn('slow');
            $('table').fadeIn('slow');
        });
        is_editor_shown = false;
    }
    if(is_editor_shown == false){
        
        DestroIfExist("dialogcompile");
    }
}

// Reopens the last document
function reopenEditor(){
    $('.actions,#file_action_panel').fadeOut('slow');
    $('table').fadeOut('slow', function(){
        $('#controls .last').not('#breadcrumb_file').removeClass('last');
        $('#editor').fadeIn('fast');
        $('#editorcontrols').fadeIn('fast', function(){

            });
    });
    is_editor_shown  = true;
    
}

// resizes the editor window
$(window).resize(function() {
    setEditorSize();
});
var is_editor_shown = false;
$(document).ready(function(){
    if(typeof FileActions!=='undefined'){
        FileActions.register('text','Edit',OC.PERMISSION_READ,function(filename){
            showFileEditor($('#dir').val(),filename);
        });
        FileActions.setDefault('text','Edit');
        FileActions.register('application/xml','Edit',OC.PERMISSION_READ,function(filename){
            showFileEditor($('#dir').val(),filename);
        });
        FileActions.setDefault('application/xml','Edit');
    }
    OC.search.customResults.Text=function(row,item){
        var text=item.link.substr(item.link.indexOf('?file=')+6);
        var a=row.find('a');
        a.data('file',text);
        a.attr('href','#');
        a.click(function(){
            var pos=text.lastIndexOf('/')
            var file=text.substr(pos + 1);
            var dir=text.substr(0,pos);
            showFileEditor(dir,file);
        });
    };
    // Binds the file save and close editor events, and gotoline button
    bindControlEvents();
    $('#editor').remove();
    
    $('#notification').click(function(){
        if($('#notification').data('reopeneditor'))
        {
            reopenEditor();
        }
        $('#notification').fadeOut();
    });
});