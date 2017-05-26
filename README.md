# backbone-view
## General
This view extends the Backbone.View with some new features:
- sub views by config
- inserting of rendered HTML by replace, append, prepend, before or after
- define a template (lodash template or underscore template or string) as property. This makes the render function in most cases obsolete
- template data function with default values
- render on initialize

## Install
```
bower install backbone-view --save
```

## Usage
Following properties are available:

- rendered           ... defines this view as rendered or not
- renderOnInitialize ... if TRUE this view will be rendered, if the view will be initialized. Default true
- templateInsertType ... defines the type of inserting the rendered HTML. Default View.TEMPLATE_INSERT_TYPE_REPLACE
    Following template insert types are available
    - View.TEMPLATE_INSERT_TYPE_REPLACE ... the content of view $el will be replaced.
    - View.TEMPLATE_INSERT_TYPE_APPEND  ... the rendered html will be appended to the view $el. View $el will be changed to the appended element.
    - View.TEMPLATE_INSERT_TYPE_PREPEND ... the rendered html will be prepended to the view $el. View $el will be changed to the prepended element.
    - View.TEMPLATE_INSERT_TYPE_BEFORE  ... the rendered html will be inserted before the view $el. View $el will be changed to the inserted element.
    - View.TEMPLATE_INSERT_TYPE_AFTER   ... the rendered html will be inserted after the view $el. View $el will be changed to the inserted element.
- config             ... defines a config for sub views. This config is an object of sub view configuration. The key defines the view name for handling by this view.
    An entry can be a function, which must return a view or a object like this
    ```js
    {
        "view": ViewLI, // defines the view constructor und must be a Function, which can be instanciated.
        "enabled": true, // enabled or disables this entry. If value TRUE, then the view will be rendered. If not, then the view will be not rendered
        "options": { // options for the view, which will be given to the view constructor
            "renderOnInitialize": false
        }
    }
    ```
    Every sub view becomes the property layout setted with the parent view.

Following functions are available:
- createView ... this will create the sub view and can be used to extends the options
- extractViewConstructor ... this function gets the sub view constructor and a callback. The callback must be called with a full qualified view constructor. This function can be used for AMD Loading.
- getTemplateDataForRender ... this function returns a object for the template, which defines the template parameters. Per default is view (the current view instance) and View (the View constructor) defined.

## Example
```html
<html>
<head>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.2.1/jquery.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/lodash.js/4.17.4/lodash.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/backbone.js/1.3.3/backbone-min.js"></script>
    <script src="https://rawgit.com/DasRed/js-backbone-prototype-compatibility/master/compatibility.js"></script>
    <script src="view.js"></script>
</head>
<body>
    <main><span>Some Text</span></main>

    <script>
        let View = Backbone.ViewEx;
        function ViewLI(options) {
            View.apply(this, arguments);
        }

        ViewLI.prototype = Object.create(View.prototype, {
            text: {
                value: null,
                enumerable: true,
                configurable: true,
                writable: true
            },

            template: {
                value: '<li>${view.text}</li>',
                enumerable: true,
                configurable: true,
                writable: true
            },

            templateInsertType: {
                value: View.TEMPLATE_INSERT_TYPE_APPEND,
                enumerable: true,
                configurable: true,
                writable: true
            }
        });


        function ViewUL(options) {
            View.apply(this, arguments);
        }

        ViewUL.prototype = Object.create(View.prototype, {
            config: {
                value: {
                    li1: {view: ViewLI, options: {text: 'li 1'}},
                    li2: {view: ViewLI, options: {text: 'li 2'}},
                    li3: {view: ViewLI, options: {text: 'li 3'}},
                    li4: {view: ViewLI, options: {text: 'li 4'}},
                    li5: {view: ViewLI, options: {text: 'li 5'}},
                },
                enumerable: true,
                configurable: true,
                writable: true
            },
            template: {
                value: '<ul>...</ul>',
                enumerable: true,
                configurable: true,
                writable: true
            }
        });

        ViewUL.prototype.createView = function(key, config) {
            config.options.el = this.$el.find('ul').eq(0);

            return View.prototype.createView.call(this, key, config);
        };

        new ViewUL({el: 'main'})
    </script>
</body>
</html>
```

This will produce following HTML:
```html
<html><head>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.2.1/jquery.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/lodash.js/4.17.4/lodash.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/backbone.js/1.3.3/backbone-min.js"></script>
    <script src="https://rawgit.com/DasRed/js-backbone-prototype-compatibility/master/compatibility.js"></script>
    <script src="view.js"></script>
</head>
<body>
    <main>
        <ul>
            <li>li 1</li>
            <li>li 2</li>
            <li>li 3</li>
            <li>li 4</li>
            <li>li 5</li>
        </ul>
    </main>
</body>
</html>
```

and following console logs:
```text
Creating view "li1" for layout.
AnonymousView (view2) created.
Start rendering of view "li1" for layout.
View "li1" rendered for layout.
View "li1" created for layout.
Creating view "li2" for layout.
AnonymousView (view3) created.
Start rendering of view "li2" for layout.
View "li2" rendered for layout.
View "li2" created for layout.
Creating view "li3" for layout.
AnonymousView (view4) created.
Start rendering of view "li3" for layout.
View "li3" rendered for layout.
View "li3" created for layout.
Creating view "li4" for layout.
AnonymousView (view5) created.
Start rendering of view "li4" for layout.
View "li4" rendered for layout.
View "li4" created for layout.
Creating view "li5" for layout.
AnonymousView (view6) created.
Start rendering of view "li5" for layout.
View "li5" rendered for layout.
View "li5" created for layout.
AnonymousView (view1) created.
```
