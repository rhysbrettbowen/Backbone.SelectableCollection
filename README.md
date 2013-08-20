# Backbone.SelectableFilter

put a "selectable" layer over an existing collection. Great for views where you want to select certain models (like a checklist).

```javascript

var collection = Backbone.collection([{
	name: 'apple'
},
{
	name: 'banana'
},
{
	name: 'orange'
}]);

var selectable = Backbone.SelectableCollection(collection);
var selected = selectable.getSelectableCollection();

selectable.select(collection.at(0));

// selected fires add event and now has apple in it's models

selectable.models; // [appleModel, bananaModel, orangeModel]
selectable.getSelected(); // [appleModel]

selectable.select(2);

// selected fires add event and now has apple & orange in it's models

selectable.getSelectedIndices(); // [0, 2]
selected.model; // [appleModel, orangeModel]

```

##Bonus!

If you use (Backbone.Advice)[https://github.com/rhysbrettbowen/Backbone.Advice] and in particular the selectable mixins for selectable views you can use the below to autmatically keep the selectable collection and views up to date:

```javascript
	Mixin.view.selectCollection = function(options) {
        this.mixin([
            Mixin.view.allowSelectableChildren
        ], options);

        this.after({
            enterDocument: function() {

                var findChildView = _.bind(function(model) {
                    return _.find(this.getAllChildren(), function(child) {
                        return child.model == model;
                    });
                }, this);

                this.listenTo(this.collection, 'select', _.bind(function(model) {
                   var child = findChildView(model);
                   if (child) {
                        child.select();
                   }
                }, this));

                this.listenTo(this.collection, 'deselect', _.bind(function(model) {
                   var child = findChildView(model);
                   if (child) {
                        child.deselect();
                   }
                }, this));
            }
        });

        this.setDefaults({
            selectModel: function(model) {
                this.collection.select(model);
            },
            deselectModel: function(model) {
                this.collection.deselect(model);
            },
            onSelect: function(e, view) {
                this.selectModel(view.model);
            },
            onDeselect: function(e, view) {
                this.deselectModel(view.model);
            }
        });

        this.addToObj({
            events: {
                'select': 'onSelect',
                'deselect': 'onDeselect'
            }
        });
    };
```