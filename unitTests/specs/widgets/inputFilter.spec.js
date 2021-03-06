/**
 * Testing inputFilter widget
 */

'use strict';
describe('An inputFilter', function(){
	var pause = window.formBuilderTesting.pause;
	var triggerWaitTime = window.formBuilderTesting.triggerWaitTime;
	var testContainer = window.formBuilderTesting.testContainer;

	var util = $.formBuilder.util;

	it('can be created', function(){
		var input = $('<input type="text"/>').inputFilter();
		var filter = input.data('formBuilderInputFilter');

		expect(input.is(':formBuilder-inputFilter')).toBe(true);
		expect(filter).toBeDefined();
	});

	it('can be created with options', function(){
		var ops = {
			toUpper: true,
			max: 100,
			pattern: /./
		};
		var input = $('<input type="text"/>').inputFilter(ops);
		var filter = input.data('formBuilderInputFilter');

		expect(input.is(':formBuilder-inputFilter')).toBe(true);
		expect(filter).toBeDefined();
		expect(filter.options.toUpper).toBe(ops.toUpper);
		expect(filter.options.max).toBe(ops.max);
		expect(filter.options.pattern).toBe(ops.pattern);
	});

	it('can set its max value', function(){
		var input = $('<input type="text"/>').inputFilter();
		var filter = input.data('formBuilderInputFilter');
		var testMax = 12;

		filter.options.max = 0;
		filter.setMax(testMax);
		expect(filter.options.max).toBe(testMax);
	});

	it('can set its pattern', function(){
		var input = $('<input type="text"/>').inputFilter();
		var filter = input.data('formBuilderInputFilter');
		var testPattern = /a-zA-Z0-9/g;

		filter.options.pattern = /./;
		filter.setPattern(testPattern);
		expect(filter.options.pattern).toBe(testPattern);
	});

	it('will schedule a clean after on paste', function(done){
		var input = $('<input type="text"/>').inputFilter();
		var filter = input.data('formBuilderInputFilter');

		spyOn(filter, '_clean');

		input.trigger('paste');
		pause(triggerWaitTime)
		.then(function(){
			expect(filter._clean).toHaveBeenCalled();
			expect(filter._clean.calls.count()).toBe(1);
			done();
		});
	});

	it('detects potential native changes from keydown events', function(done){
		var input = $('<input type="text"/>').inputFilter();
		var filter = input.data('formBuilderInputFilter');
		var code;

		expect(filter.nativeChange).toBe(false);

		code = 42; // *
		input.trigger($.Event('keydown',{which:code}));
		pause(triggerWaitTime)
		.then(function(){
			expect(filter.nativeChange).toBe(false);
			filter.nativeChange = false;

			code = 32; // space
			input.trigger($.Event('keydown',{which:code}));
			return pause(triggerWaitTime);
		})
		.then(function(){
			expect(filter.nativeChange).toBe(false);
			filter.nativeChange = false;

			code = 31; // non-char
			input.trigger($.Event('keydown',{which:code}));
			return pause(triggerWaitTime);
		})
		.then(function(){
			expect(filter.nativeChange).toBe(true);
			filter.nativeChange = false;

			code = 126; // ~
			input.trigger($.Event('keydown',{which:code}));
			return pause(triggerWaitTime);
		})
		.then(function(){
			expect(filter.nativeChange).toBe(false);
			filter.nativeChange = false;

			code = 42; // *
			input.trigger($.Event('keydown',{which:code, ctrlKey:true}));
			return pause(triggerWaitTime);
		})
		.then(function(){
			expect(filter.nativeChange).toBe(true);
			filter.nativeChange = false;

			code = 127; // non-char
			input.trigger($.Event('keydown',{which:code}));
			return pause(triggerWaitTime);
		})
		.then(function(){
			expect(filter.nativeChange).toBe(true);

			done();
		});
	});
	
	it('calls change event for new native changes on blur', function(done){
		var input = $('<input type="text"/>').inputFilter();
		var filter = input.data('formBuilderInputFilter');
		var cCount;

		// spyOn(input, 'change').and.callThrough();

		input.change(function(){
			++cCount;
		});

		filter.nativeChange = true;
		filter.memory = input.val();

		cCount = 0;
		input.trigger('blur');

		pause(triggerWaitTime)
		.then(function(){
			expect(cCount).toBe(0);

			input.nativeChange = true;
			input.trigger('blur');

			return pause(triggerWaitTime);
		})
		.then(function(){
			expect(cCount).toBe(1);
			expect(filter.nativeChange).toBe(false); //should be reset

			input.val('some val');
			input.trigger('blur');

			return pause(triggerWaitTime);
		})
		.then(function(){
			expect(cCount).toBe(2);

			done();
		});

	});


	it('can handle typing on keypress for typeable text', function(done){
		var input = $('<input type="text"/>').inputFilter();
		var filter = input.data('formBuilderInputFilter');
		var cCount = 0;
		var code;

		spyOn(filter, '_type');

		code = 42; // *
		input.trigger($.Event('keypress',{which:code}));
		pause(triggerWaitTime)
		.then(function(){
			expect(filter._type.calls.count()).toBe(++cCount);

			code = 32; // space
			input.trigger($.Event('keypress',{which:code}));
			return pause(triggerWaitTime);
		})
		.then(function(){
			expect(filter._type.calls.count()).toBe(++cCount);

			code = 31; // non-char
			input.trigger($.Event('keypress',{which:code}));
			return pause(triggerWaitTime);
		})
		.then(function(){
			expect(filter._type.calls.count()).toBe(cCount);

			code = 126; // ~
			input.trigger($.Event('keypress',{which:code}));
			return pause(triggerWaitTime);
		})
		.then(function(){
			expect(filter._type.calls.count()).toBe(++cCount);

			code = 42; // *
			input.trigger($.Event('keypress',{which:code, ctrlKey:true}));
			return pause(triggerWaitTime);
		})
		.then(function(){
			expect(filter._type.calls.count()).toBe(cCount);

			code = 127; // non-char
			input.trigger($.Event('keypress',{which:code}));
			return pause(triggerWaitTime);
		})
		.then(function(){
			expect(filter._type.calls.count()).toBe(cCount);

			done();
		});
	});

	describe('can manually type a char', function(){
		// uses caret
		
		it('to the end of the input', function(){
			var input = $('<input type="text"/>').inputFilter();
			var filter = input.data('formBuilderInputFilter');
			var isTyped;

			input.val('123456');

			isTyped = filter._type('A');

			expect(isTyped).toBe(true);
			expect(input.val()).toBe('123456A');
		});

		it('with the caret in the middle of a value without moving it', function(done){
			var input = $('<input type="text"/>').appendTo(testContainer).inputFilter();
			var filter, pos, isTyped;

			filter = input.data('formBuilderInputFilter');

			input.focus();
			pause(triggerWaitTime + 10)
			.then(function(){
				input.val('123456').caret(2,2); //start after 2

				pos = input.caret();
				++pos.begin;
				++pos.end;

				isTyped = filter._type('A');

				expect(isTyped).toBe(true);
				expect(input.val()).toBe('12A3456');
				expect(input.caret()).toEqual(pos);

				testContainer.empty();
				done();
			});
		});

		it('and can convert it to uppercase', function(){
			var input = $('<input type="text"/>').inputFilter({
				toUpper: true
			});
			var filter = input.data('formBuilderInputFilter');
			var isTyped;

			isTyped = filter._type('a');

			expect(isTyped).toBe(true);
			expect(input.val()).toBe('A');
		});

		it('and trigger status events', function(done){
			var input = $('<input type="text"/>').inputFilter({
				pattern: /[A-Z]/
			});
			var filter = input.data('formBuilderInputFilter');

			spyOn(filter, '_trigger');

			filter._type('A');
			pause(triggerWaitTime)
			.then(function(){
				expect(filter._trigger).toHaveBeenCalledWith('keytyped');
				filter._trigger.calls.reset();

				filter._type('2');
				return pause(triggerWaitTime);
			})
			.then(function(){
				expect(filter._trigger).toHaveBeenCalledWith('keyignored');
				done();
			});

		});

		it('and prevent going over the max (unfocused)', function(){
			var input = $('<input type="text"/>').inputFilter();
			var filter = input.data('formBuilderInputFilter');
			var isTyped;

			filter.setMax(6);

			input.val('123456');

			isTyped = filter._type('A');

			expect(isTyped).toBe(false);
			expect(input.val()).toBe('123456');
		});

		it('and prevent going over the max (focused)', function(){
			var input = $('<input type="text">');
			var filter, pos, isTyped;

			input.appendTo(testContainer).inputFilter();
			filter = input.data('formBuilderInputFilter');

			filter.setMax(6);
			input.focus();

			input.val('123456').caret(2,2); //start after 2

			pos = input.caret();

			isTyped = filter._type('A');

			expect(isTyped).toBe(false);
			expect(input.val()).toBe('123456');
			expect(util.equals(pos,input.caret())).toBe(true);

			testContainer.empty();
		});

		it('and pass it through a custom extraFilter', function(){
			var input = $('<input type="text"/>').appendTo(testContainer);
			var filter, testChar, isTyped;

			input.inputFilter({
				pattern: /[abc]/,
				extraFilter: function(val, inChar) {
					expect(val).toBe(input.val());
					expect(inChar).toBe(testChar);

					if(inChar === 'a') {
						return inChar;
					} else if(inChar === 'c') {
						return '[something else]';
					}

					return; //ignore all else
				}
			});

			filter = input.data('formBuilderInputFilter');

			spyOn(filter.options, 'extraFilter').and.callThrough();

			input.val('start');
			
			testChar = 'd';
			isTyped = filter._type(testChar);
			expect(isTyped).toBe(false);
			expect(filter.options.extraFilter).not.toHaveBeenCalled();
			expect(input.val()).toBe('start');

			testChar = 'a';
			isTyped = filter._type(testChar);
			expect(isTyped).toBe(true);
			expect(filter.options.extraFilter).toHaveBeenCalled();
			expect(input.val()).toBe('starta');
			filter.options.extraFilter.calls.reset();

			testChar = 'b';
			isTyped = filter._type(testChar);
			expect(isTyped).toBe(false);
			expect(filter.options.extraFilter).toHaveBeenCalled();
			expect(input.val()).toBe('starta');
			filter.options.extraFilter.calls.reset();

			testChar = 'c';
			isTyped = filter._type(testChar);
			expect(isTyped).toBe(true);
			expect(filter.options.extraFilter).toHaveBeenCalled();
			expect(input.val()).toBe('starta[something else]');
			filter.options.extraFilter.calls.reset();

			testChar = 'c';
			input.caret(3,3);
			isTyped = filter._type(testChar);
			expect(isTyped).toBe(true);
			expect(filter.options.extraFilter).toHaveBeenCalled();
			expect(input.val()).toBe('sta[something else]rta[something else]');

			testContainer.empty();

		});
	});

	it('can destroy itself', function(){
		var input = $('<input type="text"/>').inputFilter();
		var filter = input.data('formBuilderInputFilter');

		expect(filter).toBeDefined();
		
		filter.destroy();
		
		filter = input.data('formBuilderInputFilter');

		expect(filter).toBeUndefined();
	});


});