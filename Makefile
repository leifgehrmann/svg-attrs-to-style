test: install_locally test_locally

install_locally: svgo install_plugin_locally install_plugin_tests_locally

svgo:
	git clone https://github.com/svg/svgo.git
	cd svgo; npm install

install_plugin_locally:
	cp plugins/convertAttrsToStyle.js svgo/plugins

install_plugin_tests_locally:
	rm svgo/test/plugins/convertAttrsToStyle.*.svg
	cp test/plugins/convertAttrsToStyle.*.svg svgo/test/plugins/

test_locally: install_locally
	cd svgo; make

clean:
	rm -rf svgo
