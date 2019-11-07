<?php

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/

Route::get('/', 'BeatmapController@index');

Route::get('/users', function() {
    return view('users');
});

Route::get('/beatmaps', 'BeatmapController@beatmaps')->name('beatmaps');

Route::get('/test', 'TestController@test_user')->name('test_user');

Route::get('/logout', function() {
    Auth::logout(Auth::user());
    return redirect()->back();
})->name('logout');

Route::group(['namespace' => 'admin'], function() {
    Route::get('/admin-beatmaps', 'ManageBeatmapsController@index');
    Route::post('/beatmap-approve', 'ManageBeatmapsController@approve');
    Route::post('/beatmap-delete', 'ManageBeatmapsController@delete');
    Route::post('/beatmap-restore', 'ManageBeatmapsController@restore');
});


Route::group(['prefix' => 'beatmaps'], function() {
    Route::post('/', 'BeatmapsetController@store');
    Route::post('/add-modder', 'ModController@store');
});

//API
Route::group(['namespace' => 'api', 'prefix' => 'api'], function() {
    Route::get('/current-user', 'UserController@currentUser');
    Route::get('/mods', 'ModController@index');
    Route::get('/mods/{id}', 'ModController@show');
    Route::get('/nominators', 'ModController@nominatorsIndex');
    Route::get('/nominators/{id}', 'ModController@nominatorsShow');
});