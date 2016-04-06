$(document).ready(function() {
	window.bdn = (function() {
		var products = {
			'tshirt': {
				'sides': {
					'front': {
						'src': 'img/crew_front.png',
						'use_default': true
					},
					'back': {
						'src': 'img/crew_back.png',
						'use_default': true
					}
				},
				'name': 'T-Shirt',
				'product_size': {
					'width': '530px',
					'height': '630px'
				},
				'canvas_size': {
					'width': '200px',
					'height': '400px'
				},
				'canvas_position': {
					'top': '100px',
					'left': '160px'
				},
				'is_canvas_circle': true
			}
		};
		var json = {};
		var canvas;
		var current_side;
		var current_product;
		var drag_pos;

		var bdn = {
			add_product: function(product_key, product_name, sides, default_product_size, default_canvas_size, default_canvas_position, is_canvas_circle) {
				if(products[product_key] == null) {
					var sides_good = true;
					for(key in sides) {
						if(sides[key].use_default == false) {
							if(!sides[key].hasOwnProperty('canvas_size') | !sides[key].hasOwnProperty('canvas_position')) {
								sides_good = false;
								console.log('Side "' + key + '" does not use default canvas size and position but has no canvas details provided')
							}
						}
					}
					if(sides_good) {
						products[product_key] = {'sides': sides, 'name': product_name, 'product_size': default_product_size, 'canvas_size': default_canvas_size, 'canvas_position': default_canvas_position, 'is_canvas_circle': is_canvas_circle};
						console.log(products);
					}
				}
				else
					console.log('Product already exists.');
			},
			remove_product: function(product_key) {
				if(products[product_key] != null) {
					delete products[product_key];
					console.log(products);
				}
				else
					console.log('Product does not exist.');
			},
			get_product: function(product_key) {
				if(products[product_key] != null) {
					return products[product_key];
				}
				else {
					console.log('Product does not exist.');
					return false;
				}
			},
			get_all_products: function() {
				return products;
			},
			render_product_tool: function(element_id, product) {
				var el = $('#' + element_id);
				if(el.length > 0) {
					var _product = this.get_product(product);
					if(_product) {
						current_product = product;
						first_side = Object.keys(_product.sides)[0];
						product_size = _product.product_size;
						canvas_size = _product.canvas_size;
						canvas_position = _product.canvas_position;
						if(_product.sides[first_side].use_default == false) {
							canvas_size = _product.sides[first_side].canvas_size;
							canvas_position = _product.sides[first_side].canvas_position;
						}
						is_canvas_circle = _product.is_canvas_circle;

						el.addClass('bdn-template-container');
						el.css({'width': product_size.width, 'height': product_size.height});
						var img = $("<img>", {class: "bdn-product-image", src: _product.sides[first_side].src});
						var drawing_area = $("<div>", {class: "bdn-drawing-area"}).css({'width': canvas_size.width, 'height': canvas_size.height, 'top': canvas_position.top, 'left': canvas_position.left});
						var canvas_el = $("<canvas/>", {id: "bdn-canvas"});
						if(is_canvas_circle) {
							drawing_area.css('border-radius', '50%');
							canvas_el.css('border-radius', '50%');
						}
						el.append(img);
						el.append(drawing_area);
						el.find('.bdn-drawing-area').append(canvas_el);
						canvas = new fabric.Canvas('bdn-canvas', {
							width: canvas_size.width.replace('px', ''),
							height: canvas_size.height.replace('px', ''),
							hoverCursor: 'pointer',
							selection: true,
							selectionBorderColor:'blue'
						});

						for(side in _product.sides) {
							json[side] = '';
						}
						current_side = Object.keys(_product.sides)[0];

						canvas.on({
							'object:moving': function(e) {
								e.target.opacity = 0.5;
							},
							'object:modified': function(e) {
								e.target.opacity = 1;
							},
							'object:selected': onObjectSelected,
							'selection:cleared': onSelectedCleared,
							'mouse:down': function(e) {
								var active = $('.bdn-type-text-in-canvas').data('active');
								if(active) {
									canvas.add(new fabric.IText('Tap and Type', {
										fontFamily: 'helvetica',
										left: e.e.layerX,
										top: e.e.layerY,
										fill: '#000000',
										scaleX: 0.5,
										scaleY: 0.5,
										fontWeight: '',
										hasRotatingPoint: true
									}));
									$('.bdn-type-text-in-canvas').data('active', false);
									$('.bdn-type-text-in-canvas').button('toggle')
								}
							}
						});

						$(".bdn-drawing-area").hover(
							function() {
								var top = parseInt($(this).css('top')) - 1;
								var left = parseInt($(this).css('left')) - 1;
								$(this).css({'border': '1px dashed black', 'top': top, 'left': left});
							},
							function() {
								var top = parseInt($(this).css('top')) + 1;
								var left = parseInt($(this).css('left')) + 1;
								$(this).css({'border': 'none', 'top': top, 'left': left});
							}
						);
					}
				}
			},
			load_color_tool: function(element_id, colors) {
				var el = $('#' + element_id);
				if(el.length > 0) {
					var ul = $("<ul>", {class: "nav bdn-colors"});
					el.append(ul);
					for(key in colors) {
						var li = $("<li>", {class: "bdn-color-preview"}).css('background-color', colors[key]);
						el.find('ul').append(li);
					}
				}
			},
			load_icon_tool: function(element_id, default_icons, show_upload) {
				var el = $('#' + element_id);
				if(el.length > 0) {
					var icons_container = $("<div>", {class: "bdn-icons-container"});
					el.append(icons_container);
					for(key in default_icons) {
						var img = $("<img>", {class: "bdn-default-icon", src: default_icons[key], 'draggable': true});
						el.find('.bdn-icons-container').append(img);
					}
					if(show_upload) {
						var hr = $("<hr>");
						el.append(hr);
						var h4 = $("<h4>", {text: "Add Your Own Image"});
						el.append(h4);
						var input = $("<input>", {class: "bdn-upload-image-file", type: "file"});
						el.append(input);
						var button = $("<button>", {class: "bdn-upload-image-button", text: "Click here to upload"});
						el.append(button);
					}
				}
			},
			load_text_tool: function(element_id) {
				var el = $('#' + element_id);
				if(el.length > 0) {
					var text_button = $("<button>", {class: "bdn-type-text-in-canvas btn", "data-active": false, "data-toggle": 'button', text: "Type in canvas"});
					el.append(text_button);
					var div = $("<div>", {class: "input-append"});
					el.append(div);
					var input = $("<input>", {class: "bdn-text-input", type: "text", placeholder: "Add text here..."});
					el.find(".input-append").append(input);
					var button = $("<button>", {class: "btn bdn-add-text-button", title: "Add text"});
					el.find(".input-append").append(button);
					var icon = $("<i>", {class: "icon-share-alt"});
					el.find(".input-append button").append(icon);

					var text_editor1 = $("<div>", {class: "bdn-text-editor btn-group"});
					/* Add font family button*/
					var button = $("<button>", {class: "btn dropdown-toggle", 'data-toggle': "dropdown", 'data-original-title': "Font Style"});
					button.append($("<i>", {class: "icon-font"}).css({"width": "19px", "height": "19px"}));
					text_editor1.append(button);
					/* Add font fmaily dropdown */
					var ul = $("<ul>", {class: "bdn-font-family dropdown-menu", role: "menu"});
					var fonts = ['Arial', 'Helvetica', 'Myriad Pro', 'Delicious', 'Verdana', 'Georgia', 'Courier', 'Comic Sans MS', 'Impact', 'Monaco', 'Optima', 'Hoefler Text', 'Plaster', 'Engagement'];
					for(key in fonts) {
						var f_class = fonts[key].replace(" ", "");
						ul.append($("<li>").append($("<a>", {tabindex: -1, href: "#", 'data-font-family': fonts[key], class: f_class, text: fonts[key]})));
					}
					text_editor1.append(ul);
					/* Add font weight button */
					var button = $("<button>", {class: "btn dropdown-toggle bdn-font-bold", 'data-original-title': "Bold"});
					button.append($("<img>", {src: "img/font_bold.png"}));
					text_editor1.append(button);
					/* Add font italize button */
					var button = $("<button>", {class: "btn dropdown-toggle bdn-font-italize", 'data-original-title': "Italic"});
					button.append($("<img>", {src: "img/font_italic.png"}));
					text_editor1.append(button);
					/* Add font strike button */
					var button = $("<button>", {class: "btn dropdown-toggle bdn-font-strike", 'data-original-title': "Strikethrough"});
					button.append($("<img>", {src: "img/font_strikethrough.png"}));
					text_editor1.append(button);
					/* Add text_editor1 to el */
					el.append(text_editor1);

					var text_editor2 = $("<div>", {class: "bdn-text-editor btn-group"});
					/* Add font weight button */
					var button = $("<button>", {class: "btn dropdown-toggle bdn-font-underline", 'data-original-title': "Underline"});
					button.append($("<img>", {src: "img/font_underline.png"}));
					text_editor2.append(button);
					/* Add font color button */
					var a = $("<a>", {class: "btn", href: "#", ref: "tooltip", 'data-placement': "top", 'data-original-title': "Font Color"});
					a.append($("<input>", {class: "bdn-font-color", type: "hidden", size: 7, value: "#000000"}));
					text_editor2.append(a);
					/* Add font border color button */
					var a = $("<a>", {class: "btn", href: "#", ref: "tooltip", 'data-placement': "top", 'data-original-title': "Font Border Color"});
					a.append($("<input>", {class: "bdn-font-border-color", type: "hidden", size: 7, value: "#000000"}));
					text_editor2.append(a);
					/* Add text_editor2 to el */
					el.append(text_editor2);

					var position_editor = $("<div>", {class: "bdn-position-editor btn-group"});
					/* Add bring to front button */
					var button = $("<button>", {class: "btn bdn-bring-to-front", 'data-original-title': "Bring to Front"});
					button.append($("<i>", {class: "icon-fast-backward rotate"}).css("height", "19px"));
					position_editor.append(button);
					/* Add bring to back button */
					var button = $("<button>", {class: "btn bdn-bring-to-back", 'data-original-title': "Bring to Back"});
					button.append($("<i>", {class: "icon-fast-forward rotate"}).css("height", "19px"));
					position_editor.append(button);
					/* Add remove active object button */
					var button = $("<button>", {class: "btn bdn-remove-object", 'data-original-title': "Remove Selected Object"});
					button.append($("<i>", {class: "icon-trash"}).css("height", "19px"));
					position_editor.append(button);
					/* Add text_editor2 to el */
					el.append(position_editor);

					/* Set font color */
					$('.bdn-font-color').miniColors({
						change: function(hex, rgb) {
							var activeObject = canvas.getActiveObject();
							if(activeObject && activeObject.type === 'i-text') {
								activeObject.fill = this.value;
								canvas.renderAll();
							}
						},
						open: function(hex, rgb) {
							//
						},
						close: function(hex, rgb) {
							//
						}
					});

					/* Set font border color */
					$('.bdn-font-border-color').miniColors({
						change: function(hex, rgb) {
							var activeObject = canvas.getActiveObject();
							if(activeObject && activeObject.type === 'i-text') {
								activeObject.strokeStyle = this.value;
								canvas.renderAll();
							}
						},
						open: function(hex, rgb) {
							//
						},
						close: function(hex, rgb) {
							//
						}
					});
					$("button, a").tooltip();
				}
			},
			show_flip_tool: function(element_id) {
				var el = $('#' + element_id);
				if(el.length > 0) {
					var button;
					if(el.is("button")) {
						button = el;
						el.addClass('bdn-flip-button btn btn-large btn-block btn-primary');
						el.text("Next");
					}
					else {
						button = $("<button>", {class: "bdn-flip-button btn btn-large btn-block btn-primary", text: "Next"});
						el.append(button);
						button = el.find('.bdn-flip-button');
					}
				}
			},
			show_export_svg_tool: function(element_id) {
				var el = $('#' + element_id);
				if(el.length > 0) {
					var button;
					if(el.is("button")) {
						button = el;
						el.addClass('bdn-export-svg-button btn btn-large btn-block btn-success');
						if(el.text() == "") {
							el.text("Export SVG");
						}
					}
					else {
						button = $("<button>", {class: "bdn-export-svg-button btn btn-large btn-block btn-success", text: "Export SVG"});
						el.append(button);
						button = el.find('.bdn-export-svg-button');
					}
				}
			}
		};

		/* On selecting active object */
		function onObjectSelected(e) {
			var selectedObject = e.target;
			$(".bdn-text-input").val("");
			selectedObject.hasRotatingPoint = true;
			selectedObject.bringToFront();
			if(selectedObject && selectedObject.type === 'i-text') {
				//display text editor
				$(".bdn-text-editor").css('display', 'block');
				$(".bdn-position-editor").css('display', 'block');
				$(".bdn-text-input").val(selectedObject.getText());
				$('.bdn-font-color').miniColors('value', selectedObject.fill);
				$('.bdn-font-border-color').miniColors('value', selectedObject.strokeStyle);
			}
			else if(selectedObject && selectedObject.type === 'image'){
				//display image editor
				$(".bdn-text-editor").css('display', 'none');
				$(".bdn-position-editor").css('display', 'block');
			}
		}

		/* On deselecting active object */
		function onSelectedCleared(e) {
			$(".bdn-text-editor").css('display', 'none');
			$(".bdn-position-editor").css('display', 'none');
			$(".bdn-text-input").val("");
		}

		/* Change product color */
		$("body").on("click", ".bdn-color-preview", function() {
			var color = $(this).css("background-color");
			$('.bdn-template-container').css('background-color', color);
		});

		/* Add default icons to canvas */
		$("body").on("click", ".bdn-default-icon", function(e) {
			var el = e.target;
			var offset = 50;
			var left = fabric.util.getRandomInt(0 + offset, 200 - offset);
			var top = fabric.util.getRandomInt(0 + offset, 400 - offset);
			fabric.Image.fromURL(el.src, function(image) {
				image.set({
					left: left,
					top: top,
					angle: 0,
					padding: 10,
					cornersize: 10,
					hasRotatingPoint: true
				});
				canvas.add(image);
			});
		});

		/* Adding default icons by dragging into canvas */
		$("body").on("mousedown", ".bdn-default-icon", function(ev) {
			drag_pos = [ev.pageX, ev.pageY];
		});

		var drag_element;
		$("body").on("dragstart", ".bdn-default-icon", function(ev) {
			ev.originalEvent.dataTransfer.setData("src", ev.target.src);
			drag_element = $(this);
		});

		$("body").on("drop", ".bdn-drawing-area", function(ev) {
			ev.preventDefault();
			var data = ev.originalEvent.dataTransfer.getData("src");

			var drop_pos = [ev.originalEvent.pageX, ev.originalEvent.pageY];
			var canvas_pos = [$("#bdn-canvas").offset().left, $("#bdn-canvas").offset().top];
			var element_pos = [drag_element.offset().left, drag_element.offset().top];

			var dx = (drop_pos[0]- (drag_pos[0] - element_pos[0])) - canvas_pos[0];
			var dy = (drop_pos[1]- (drag_pos[1] - element_pos[1])) - canvas_pos[1];

			fabric.Image.fromURL(data, function(image) {
				image.set({
					left: dx + 6,
					top: dy + 6,
					angle: 0,
					padding: 10,
					cornersize: 10,
					hasRotatingPoint: true
				});
				canvas.add(image);
			});

			var top = parseInt($(this).css('top')) + 1;
			var left = parseInt($(this).css('left')) + 1;
			$(this).css({'top': top, 'left': left});
		});

		$("body").on("dragover", ".bdn-drawing-area", function(ev) {
			var _product = bdn.get_product(current_product);
			canvas_position = _product.canvas_position;
			if(_product.sides[current_side].use_default == false) {
				canvas_position = _product.sides[current_side].canvas_position;
			}
			var top = parseInt(canvas_position.top.replace('px', '')) - 1;
			var left = parseInt(canvas_position.left.replace('px', '')) - 1;
			$(this).css({'border': '1px dashed black', 'top': top, 'left': left});
			ev.preventDefault();
		});

		$("body").on("dragleave", ".bdn-drawing-area", function(ev) {
			var _product = bdn.get_product(current_product);
			canvas_position = _product.canvas_position;
			if(_product.sides[current_side].use_default == false) {
				canvas_position = _product.sides[current_side].canvas_position;
			}
			var top = canvas_position.top;
			var left = canvas_position.left;
			$(this).css({'border': 'none', 'top': top, 'left': left});
			ev.preventDefault();
		});
		/* End icon dragging code */

		/* Add image file to canvas */
		$("body").on("click", ".bdn-upload-image-button", function(e) {
			var reader = new FileReader();
			reader.onload = function (event) {
				var offset = 50;
				var left = fabric.util.getRandomInt(0 + offset, 200 - offset);
				var top = fabric.util.getRandomInt(0 + offset, 400 - offset);
				fabric.Image.fromURL(event.target.result, function(image) {
					image.set({
						left: left,
						top: top,
						angle: 0,
						padding: 10,
						cornersize: 10,
						hasRotatingPoint: true
					});
					canvas.add(image);
				});
			}
			reader.readAsDataURL($('.bdn-upload-image-file')[0].files[0]);
		});

		/* Activate click to canvas and type text */
		$("body").on("click", ".bdn-type-text-in-canvas", function() {
			var active = $(this).data('active');
			active = !active;
			$(this).data('active', active);
		});

		/* Add text to canvas */
		$("body").on("click", ".bdn-add-text-button", function() {
			var text = $(".bdn-text-input").val();
			var textSample = new fabric.IText(text, {
				left: fabric.util.getRandomInt(0, 200),
				top: fabric.util.getRandomInt(0, 400),
				fontFamily: 'helvetica',
				angle: 0,
				fill: '#000000',
				scaleX: 0.5,
				scaleY: 0.5,
				fontWeight: '',
				hasRotatingPoint: true
			});
			canvas.add(textSample);
			canvas.item(canvas.item.length-1).hasRotatingPoint = true;
			$(".bdn-text-editor").css('display', 'block');
			$(".bdn-position-editor").css('display', 'block');
		});

		/* Modify text in text input */
		$("body").on("keyup", ".bdn-text-input", function() {
			var activeObject = canvas.getActiveObject();
			if(activeObject && activeObject.type === 'i-text') {
				activeObject.text = this.value;
				canvas.renderAll();
			}
		});

		/* Set font family */
		$("body").on("click", ".bdn-font-family li a", function() {
			var activeObject = canvas.getActiveObject();
			if(activeObject && activeObject.type === 'i-text') {
				activeObject.fontFamily = $(this).data('font-family');
				canvas.renderAll();
			}
		});

		/* Set font weight */
		$("body").on("click", ".bdn-font-bold", function() {
			var activeObject = canvas.getActiveObject();
			if(activeObject && activeObject.type === 'i-text') {
				activeObject.fontWeight = (activeObject.fontWeight == 'bold' ? '' : 'bold');
				canvas.renderAll();
			}
		});

		/* Set font italize */
		$("body").on("click", ".bdn-font-italize", function() {
			var activeObject = canvas.getActiveObject();
			if(activeObject && activeObject.type === 'i-text') {
				activeObject.fontStyle = (activeObject.fontStyle == 'italic' ? '' : 'italic');
				canvas.renderAll();
			}
		});

		/* Set font strikethrough */
		$("body").on("click", ".bdn-font-strike", function() {
			var activeObject = canvas.getActiveObject();
			if(activeObject && activeObject.type === 'i-text') {
				activeObject.textDecoration = (activeObject.textDecoration == 'line-through' ? '' : 'line-through');
				canvas.renderAll();
			}
		});

		/* Set font underline */
		$("body").on("click", ".bdn-font-underline", function() {
			var activeObject = canvas.getActiveObject();
			if(activeObject && activeObject.type === 'i-text') {
				activeObject.textDecoration = (activeObject.textDecoration == 'underline' ? '' : 'underline');
				canvas.renderAll();
			}
		});

		/* Bring object to front */
		$("body").on("click", ".bdn-bring-to-front", function() {
			var activeObject = canvas.getActiveObject(),
				activeGroup = canvas.getActiveGroup();
			if(activeObject) {
				activeObject.bringToFront();
			}
			else if(activeGroup) {
				var objectsInGroup = activeGroup.getObjects();
				canvas.discardActiveGroup();
				objectsInGroup.forEach(function(object) {
					object.bringToFront();
				});
			}
		});

		/* Bring object to back */
		$("body").on("click", ".bdn-bring-to-back", function() {
			var activeObject = canvas.getActiveObject(),
				activeGroup = canvas.getActiveGroup();
			if(activeObject) {
				activeObject.sendToBack();
			}
			else if(activeGroup) {
				var objectsInGroup = activeGroup.getObjects();
				canvas.discardActiveGroup();
				objectsInGroup.forEach(function(object) {
					object.sendToBack();
				});
			}
		});

		/* Remove object */
		$("body").on("click", ".bdn-remove-object", function() {
			var activeObject = canvas.getActiveObject(),
				activeGroup = canvas.getActiveGroup();
			if(activeObject) {
				canvas.remove(activeObject);
				$(".bdn-text-input").val("");
			}
			else if(activeGroup) {
				var objectsInGroup = activeGroup.getObjects();
				canvas.discardActiveGroup();
				objectsInGroup.forEach(function(object) {
					canvas.remove(object);
				});
			}
		});

		$('html').keyup(function(e){
			if(e.keyCode == 46) {
				var activeObject = canvas.getActiveObject(),
					activeGroup = canvas.getActiveGroup();
				if(activeObject) {
					canvas.remove(activeObject);
					$(".bdn-text-input").val("");
				}
				else if(activeGroup) {
					var objectsInGroup = activeGroup.getObjects();
					canvas.discardActiveGroup();
					objectsInGroup.forEach(function(object) {
						canvas.remove(object);
					});
				}
			}
		}) ;

		/* Flip product sides */
		$("body").on("click", ".bdn-flip-button", function() {
			json[current_side] = JSON.stringify(canvas);
			var _product = bdn.get_product(current_product);

			var product_size = _product.product_size;
			var canvas_size = _product.canvas_size;
			var canvas_position = _product.canvas_position;

			var is_current_key = null;
			var next_side = false;
			for(key in json) {
				if(is_current_key == null) {
					next_side = key
					is_current_key = false
				}
				if(is_current_key == true) {
					next_side = key;
					break;
				}
				if(key == current_side) {
					is_current_key = true;
				}
			}
			current_side = next_side;
			$(".bdn-product-image").attr("src", _product.sides[next_side].src);
			if(_product.sides[next_side].use_default == false) {
				canvas_size = _product.sides[next_side].canvas_size;
				canvas_position = _product.sides[next_side].canvas_position;
			}

			$('.bdn-drawing-area').css({'width': canvas_size.width, 'height': canvas_size.height, 'top': canvas_position.top, 'left': canvas_position.left});

			canvas.setDimensions({
				"width": canvas_size.width.replace('px', ''),
				"height": canvas_size.height.replace('px', '')
			});

			canvas.clear();
			try
			{
				var _json = JSON.parse(json[next_side]);
				canvas.loadFromJSON(json[next_side]);
			}
			catch(e)
			{}
			setTimeout(function() {
				canvas.calcOffset();
				canvas.renderAll();
			}, 100);
		});

		/* Export to svg */
		$("body").on("click", ".bdn-export-svg-button", function() {
			var _product = bdn.get_product(current_product);
			var svg = canvas.toSVG();
			if(_product.is_canvas_circle) {
				svg = svg.replace('<svg', '<svg style="border-radius: 50%;"');
			}
			window.open(
				'data:image/svg+xml;utf8,' +
				encodeURIComponent(svg)
			);
		});

		return bdn;
	}());
});