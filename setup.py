from setuptools import Command, setup

setup(
    name='backbone_bubble',
    version='0.0.1',
    url='http://github.com/tarunc/backbone_bubble/',
    license='MIT',
    author='Tarun',
    author_email='tarunc92@gmail.com',
    long_description=__doc__,
    packages=['basic_app'],
    include_package_data=True,
    zip_safe=False,
    platforms='any',
    install_requires=[
        'Flask>=0.10',
        'simplejson>=3.3'
    ]
)