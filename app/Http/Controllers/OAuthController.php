<?php

namespace App\Http\Controllers;

use App\Event;
use App\User;
use Auth;
use Illuminate\Http\Request;

class OauthController extends Controller
{
    private $redirect = 'https://christmas-queue.tk/callback';

    public function getToken(Request $request)
    {
        $request->session()->put('state', $state = Str::random(40));

        $query = http_build_query([
            'client_id' => env('CLIENT_ID'),
            'redirect_uri' => $redirect,
            'response_type' => 'code',
            'scope' => '',
            'state' => $state,
        ]);
        return redirect('http://osu.ppy.sh/oauth/authorize?'.$query);
    }

    public function getUserData(Request $request)
    {
        $state = $request->session()->pull('state');

        if(!(strlen($state) > 0 && $state === $request->state))
        {
            return redirect('/')->with('error', 'Seems like something went wrong...');
        }

        $http = new \GuzzleHttp\Client;

        try {
            $response = $http->post('http://osu.ppy.sh/oauth/token', [
                'form_params' => [
                    'grant_type' => 'authorization_code',
                    'client_id' => env('CLIENT_ID'),
                    'client_secret' => env('CLIENT_SECRET'),
                    'redirect_uri' => $redirect,
                    'code' => $request->code,
                ],
            ]);

        } catch (\Exception $e) {
            return redirect('/')->with('error', 'Something went wrong...');
        }

        $data = json_decode((string) $response->getBody(), true);
        $token = $data['access_token'];

        $userData = $http->request('GET', 'https://osu.ppy.sh/api/v2/me', [
            'headers' => [
                'Accept' => 'application/json',
                'Authorization' => 'Bearer '.$token,
            ],
        ]);

        $userApi = json_decode((string) $userData->getBody(), true);

        return $userApi;

        $osuUserId = $userApi['id'];
    }
}