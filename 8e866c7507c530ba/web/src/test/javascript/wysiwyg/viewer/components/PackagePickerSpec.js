describe("PackagePicker", function () {
	testRequire()
		.classes('core.managers.components.ComponentBuilder')
		.components('wysiwyg.common.components.packagepicker.viewer.PackagePicker')
		.resources('W.Utils', 'W.Viewer', 'W.Commands', 'W.Data', 'W.ComponentLifecycle');

	beforeEach(function () {
		this.componentLogic = null;

		var data = this.W.Data.createDataItem({
				type: 'PackagePicker',
				tooltipText: 'some text'
			}),
			builder = new this.ComponentBuilder(document.createElement('div'));

		builder
			.withType('wysiwyg.common.components.packagepicker.viewer.PackagePicker')
			.withSkin('wysiwyg.common.components.packagepicker.viewer.skins.PackagePickerSkin')
			.withData(data)
			._with("htmlId", "mockId")
			.onWixified(function (component) {
				this.componentLogic = component;
			}.bind(this))
			.create();

		waitsFor(function () {
			return this.componentLogic;
		}, "PP to be ready", 1000);
	});

	describe('tests for the component structure', function () {


		it("should have tooltipArea skinpart", function () {
			expect(this.componentLogic._skinParts.tooltipArea).toBeDefined();
		});

		it("should have tooltip skinpart", function () {
			expect(this.componentLogic._skinParts.tooltip).toBeDefined();
		});

		it("should have actionButton skinpart", function () {
			expect(this.componentLogic._skinParts.actionButton).toBeDefined();
		});

		it("should have placeholder skinpart", function () {
			expect(this.componentLogic._skinParts.placeholder).toBeDefined();
		});

		it("should have radioElement skinpart", function () {
			expect(this.componentLogic._skinParts.radioElement).toBeDefined();
		});

		it('placeholder should contain exactly 4 elements', function () {
			expect(this.componentLogic._skinParts.placeholder.children.length).toBe(4);
		});

		it('radioElement should contain exactly one INPUT tag', function () {
			expect(this.componentLogic._skinParts.radioElement.getElementsByTagName('input').length).toBe(1);
		});

		it('tooltip should be a InfoTip component', function () {
			expect(this.componentLogic._skinParts.tooltip.$className).toBe('wysiwyg.common.components.InfoTip');
		});

	});

	describe('tests for components simple methods', function () {
		it('the component should set _pageViewEventDisabled param while running _disablePageViewEventFiring', function () {

			this.componentLogic._disablePageViewEventFiring();

			expect(this.componentLogic._pageViewEventDisabled).toBe(true);
		});


		it('test', function () {

			spyOn(this.Commands, 'executeCommand');

			this.componentLogic._actionSelect();

			expect(this.Commands.executeCommand).toHaveBeenCalled();
		});


	});

});