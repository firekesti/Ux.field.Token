Ext.define('Ux.field.Token', {
    extend : 'Ext.field.Text',
    xtype  : 'tokenfield',

    requires : [
        'Ext.XTemplate',
        'Ux.field.TokenInput'
    ],

    config : {
        cls        : 'ux-field-token',
        component  : {
            xtype : 'tokeninput'
        },
        tokenValue : null,
        delimiter  : ',',
        tokenTpl   : '<tpl for="."><a class="ux-token" data-idx="{#}">{.}<span href="#" class="ux-token-clear"></span></a></tpl>',
        largeTapArea: false,
        tokenOnEnter: true,
        tokenOnBlur: true
    },

    applyTokenTpl : function(tpl) {
        return new Ext.XTemplate(tpl);
    },

    applyValue : function(newValue) {
        if (Ext.isArray(newValue)) {
            newValue = newValue.join(this.getDelimiter());
        }

        return newValue;
    },

    updateValue : function(newValue, oldValue) {
        this.callParent([newValue, oldValue]);

        if (newValue) {
            newValue = newValue.split(this.getDelimiter());
        } else {
            newValue = [];
        }

        this.setTokenValue(newValue);

        var component = this.getComponent(),
            tokenEl   = component.tokenEl,
            tokenTpl  = this.getTokenTpl();

        tokenTpl.overwrite(tokenEl, newValue);

        this.syncSize();
    },

    updateComponent : function(newComponent, oldComponent) {
        this.callParent([newComponent, oldComponent]);

        newComponent.tokenEl.on('tap', this.onTokenElTap, this);
    },

    syncSize : function() {
        if (!this.rendered) {
            /**
             * This checks to see if a painted listener has already been
             * added. If not then add the painted listener, this should
             * save some perf if you call syncSize often when not rendered.
             */
            var oldObservableType = this.observableType;

            this.observableType = 'element';

            if (!this.hasListener('painted')) {
                this.on('painted', this.syncSize, this);
            }

            this.observableType = oldObservableType;

            return;
        }

        var tokenValue = this.getTokenValue() || [];
        if (tokenValue.length) {
            this.showClearIcon();
        }

        var component   = this.getComponent(),
            componentEl = component.element,
            tokenEl     = component.tokenEl,
            input       = component.input,
            clearIcon   = component.clearIcon,
            newWidth    = componentEl.getWidth() - clearIcon.getWidth() - tokenEl.getWidth() - 1;

        input.setWidth(newWidth);
    },

    doKeyUp : function(me, e) {
        this.callParent([me, e]);
        var lastChar = me.getValue()[me.getValue().length-1];
        if(lastChar == me.getDelimiter()){
            this.syncValues();
        }
        this.syncSize();
    },

    doAction : function() {
        if(!this.getTokenOnEnter()){
            return;
        }
        var lastChar = this.getValue()[this.getValue().length-1];
        if(lastChar != this.getDelimiter()){
            this.syncValues();
        }
    },

    onBlur : function(e, t) {
        this.callParent([e, t]);
        if(this.getTokenOnBlur()){
            this.syncValues();            
        }
    },

    syncValues : function() {
        var tokenValue = this.getTokenValue() || [],
            endingDelimiter = new RegExp(this.getDelimiter() + '$')
            inputValue = this.getValue().replace(endingDelimiter,'').trim().split(this.getDelimiter()),
            newValue = tokenValue;
        this._value = '';
        if(inputValue != ""){
            newValue = tokenValue.concat(inputValue);
        }
        this.setValue(newValue);
    },

    onTokenElTap : function(e) {
        var target, tokenValue, anchor, idx, item;
        
        if(!this.getLargeTapArea()){
            target = e.getTarget('span.ux-token-clear', null, true);
            if (target) {
                tokenValue = this.getTokenValue();
                anchor     = target.up('a.ux-token');
                idx        = anchor.getAttribute('data-idx') - 1;
                item       = tokenValue[idx];

                this.setValue(
                    Ext.Array.remove(tokenValue, item)
                );
            }
        }
        else {
            target = e.getTarget('a.ux-token', null, true);
            if (target) {
                tokenValue = this.getTokenValue();
                idx        = target.getAttribute('data-idx') - 1;
                item       = tokenValue[idx];

                this.setValue(
                    Ext.Array.remove(tokenValue, item)
                );
            }            
        }
    },

    showClearIcon : function() {
        var me         = this,
            value      = me.getTokenValue(),
            nonTokenValue = me._value;
            valueValid = value !== undefined && value !== null && value !== '' && value.length
            nonTokenValueValid = nonTokenValue !== undefined && nonTokenValue !== null && nonTokenValue !== '' && nonTokenValue.length;            

        if (me.getClearIcon() && !me.getDisabled() && !me.getReadOnly() && (valueValid || nonTokenValueValid)) {
            me.element.addCls(Ext.baseCSSPrefix + 'field-clearable');
        }

        return me;
    }
});