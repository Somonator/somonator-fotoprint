let storage_key = 'fotoprint',
    $img_input =  $('#img_input'),
    $editor_wrap = $('#editor_wrap'),
    $print_img = $('#print_img'),
    $img_caption = $('#img_caption'),
    $editor_manage = $('#editor_manage'),
    save_timeout;

$img_input.change(function(event) {
    event.preventDefault();

    let file = this.files[0],
        reader = new FileReader();;

    reader.onloadend = function() {
        $print_img.attr('src', reader.result).show();
    }

    if (file) reader.readAsDataURL(file);
});

$editor_manage.change(function(event) {
    event.preventDefault();

    let form_data = $(this).serializeArray().reduce(function(obj, item) {
        obj[item.name] = item.value;

        return obj;
    }, {});

    console.log(form_data);

    $editor_wrap.add($print_img).css({
        'width': form_data['img-width'],
        'height': form_data['img-height']
    });

    $print_img.css({
        'object-fit': form_data['img-size'],
        'object-position': form_data['img-pos-x'] + 'px ' + form_data['img-pos-y'] + 'px',
        'filter': `contrast(` + form_data['img-contrast'] + `%) 
                   brightness(` + form_data['img-brightness'] + `%)
                   saturate(` + form_data['img-saturate'] + `%)
                   grayscale(` + form_data['img-grayscale'] + `%)`
    });

    $img_caption.show().text(form_data['caption-title']).css({
        'font-size': form_data['caption-font-size'] + 'px',
        'color': form_data['caption-color'],
        'top': '',
        'right': '',
        'bottom': '',
        'left': ''
    });

    if (form_data['caption-position'] === 'top-left') {
        $img_caption.css({
            'top': form_data['caption-pos-y'] + 'px', 
            'left': form_data['caption-pos-x'] + 'px'
        });
    } else if (form_data['caption-position'] === 'top-right') {
        $img_caption.css({
            'top': form_data['caption-pos-y'] + 'px',
            'right': form_data['caption-pos-x'] + 'px'
        });
    } else if (form_data['caption-position'] === 'bottom-right') {
        $img_caption.css({
            'bottom': form_data['caption-pos-y'] + 'px',
            'right': form_data['caption-pos-x'] + 'px'
        });
    } else if (form_data['caption-position'] === 'bottom-left') {
        $img_caption.css({
            'bottom': form_data['caption-pos-y'] + 'px',
            'left': form_data['caption-pos-x'] + 'px'
        });
    }

    if (form_data['caption-custom-css']) {
        $('#caption_custom_css').remove();
        $('body').append(`<style id="caption_custom_css">
            .editor-wrap .img-caption {`
                + form_data['caption-custom-css'] +
            `}
        </style>`);
    }    

    clearTimeout(save_timeout);
    setTimeout(function() {
        save_storage(form_data);
    }, 1000);
});

$editor_manage.find('.rotate-canvas').click(function(event) {
    event.preventDefault();

    let w_input = $editor_manage.find('input[name="img-width"]'),
        h_input = $editor_manage.find('input[name="img-height"]'),
        w = w_input.val(),
        h = h_input.val();

    w_input.val(h);
    h_input.val(w);

    $editor_manage.change();
});

$editor_manage.find('input[type="range"]').on('input', function(event) {
    let val = $(this).val();

    $(this).parents('.field-wrap').find('label span').text(val);
});

$editor_manage.find('input[name="caption-title"], input[type="color"]').on('input', function(event) {
    $editor_manage.change();
});

$editor_manage.find('input[type="reset"]').click(function(event) {
    // wait reset
    setTimeout(function() {
        $editor_manage.change();
        $editor_manage.find('input[type="range"]').trigger('input');
    }, 50);
});

$editor_manage.find('.submit').click(function(event) {
    event.preventDefault();

    $editor_wrap.printThis({
        printContainer: true,
        loadCSS: 'css/print.css'
    });
});

$editor_manage.submit(function(event) {
    event.preventDefault();

    // disable submit

    return false;
});

$(document).on('keydown', function(event) {
    if ((event.ctrlKey || event.metaKey) && (event.key === 'p' || event.charCode == 16 || event.charCode == 112 || event.keyCode == 80)) {
        event.cancelBubble = true;
        event.preventDefault();
        event.stopImmediatePropagation();

        $editor_wrap.printThis({
            printContainer: true,
            loadCSS: 'css/print.css'
        });
    }  
});

$(document).ready(function() {
    let save_data = get_storage_data();

    $.each(save_data, function(key, val) {
        $editor_manage.find('[name="' + key + '"]').val(val);
    });

    $editor_manage.change();
    $editor_manage.find('input[type="range"]').trigger('input');
});


function get_storage_data() {
    let save_data = JSON.parse(localStorage.getItem(storage_key));

    return save_data;
}

function save_storage(data) {
    let save_data = JSON.stringify(data);

    localStorage.setItem(storage_key, save_data);
}